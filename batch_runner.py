#!/Users/gulzhanserikbay/.openclaw/workspace/.venv/bin/python3
"""
D OS Batch Runner — Anthropic Batch API интеграциясы
50% арзан, 24 сағат ішінде нәтиже

Қолдану:
  python batch_runner.py submit    # Тапсырмаларды жіберу
  python batch_runner.py status    # Статус тексеру
  python batch_runner.py results   # Нәтижелерді алу
  python batch_runner.py add "тапсырма" [--id custom_id] [--model opus]
"""

import anthropic
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# .env файлын жүктеу
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key.strip()] = value.strip()

# Paths
WORKSPACE = Path(__file__).parent
TASKS_FILE = WORKSPACE / "batch_tasks" / "pending.json"
ACTIVE_FILE = WORKSPACE / "batch_tasks" / "active.json"
RESULTS_DIR = WORKSPACE / "batch_results"

# Model mapping
MODELS = {
    "opus": "claude-opus-4-5-20250929",
    "sonnet": "claude-sonnet-4-5-20250929",
    "haiku": "claude-haiku-4-5-20251001",
}

DEFAULT_MODEL = "sonnet"  # Batch үшін sonnet жеткілікті, opus-тан 10x арзан


def get_client():
    """Anthropic client инициализациясы"""
    # Алдымен env variable тексеру
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    
    # Жоқ болса, OpenClaw auth-тен оқу
    if not api_key:
        auth_path = Path.home() / ".openclaw" / "agents" / "main" / "agent" / "auth-profiles.json"
        if auth_path.exists():
            with open(auth_path) as f:
                auth = json.load(f)
                # anthropic:default профилінен api_key алу
                profile = auth.get("anthropic:default", {})
                api_key = profile.get("apiKey")
    
    if not api_key:
        print("❌ ANTHROPIC_API_KEY табылмады!")
        print("   export ANTHROPIC_API_KEY=sk-ant-...")
        sys.exit(1)
    
    return anthropic.Anthropic(api_key=api_key)


def load_tasks():
    """Pending тапсырмаларды оқу"""
    if not TASKS_FILE.exists():
        return []
    with open(TASKS_FILE) as f:
        return json.load(f)


def save_tasks(tasks):
    """Тапсырмаларды сақтау"""
    TASKS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(TASKS_FILE, "w") as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)


def load_active():
    """Активті batch-тарды оқу"""
    if not ACTIVE_FILE.exists():
        return {}
    with open(ACTIVE_FILE) as f:
        return json.load(f)


def save_active(active):
    """Активті batch-тарды сақтау"""
    ACTIVE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(ACTIVE_FILE, "w") as f:
        json.dump(active, f, indent=2, ensure_ascii=False)


def add_task(prompt: str, custom_id: str = None, model: str = DEFAULT_MODEL):
    """Жаңа тапсырма қосу"""
    tasks = load_tasks()
    
    if custom_id is None:
        custom_id = f"task-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{len(tasks)}"
    
    model_id = MODELS.get(model, model)
    
    task = {
        "custom_id": custom_id,
        "params": {
            "model": model_id,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}]
        },
        "added_at": datetime.now().isoformat()
    }
    
    tasks.append(task)
    save_tasks(tasks)
    print(f"✅ Тапсырма қосылды: {custom_id}")
    print(f"   Model: {model_id}")
    print(f"   Pending: {len(tasks)} тапсырма")


def submit_batch():
    """Batch API-ға жіберу"""
    tasks = load_tasks()
    
    if not tasks:
        print("📭 Жіберетін тапсырма жоқ")
        return
    
    client = get_client()
    
    # Batch request дайындау
    requests = []
    for task in tasks:
        requests.append({
            "custom_id": task["custom_id"],
            "params": task["params"]
        })
    
    print(f"📤 {len(requests)} тапсырма жіберілуде...")
    
    try:
        batch = client.messages.batches.create(requests=requests)
        
        # Активке қосу
        active = load_active()
        active[batch.id] = {
            "id": batch.id,
            "status": batch.processing_status,
            "created_at": datetime.now().isoformat(),
            "task_count": len(requests),
            "task_ids": [t["custom_id"] for t in tasks]
        }
        save_active(active)
        
        # Pending тазалау
        save_tasks([])
        
        print(f"✅ Batch жіберілді!")
        print(f"   ID: {batch.id}")
        print(f"   Status: {batch.processing_status}")
        print(f"   Tasks: {len(requests)}")
        
    except Exception as e:
        print(f"❌ Қате: {e}")
        sys.exit(1)


def check_status():
    """Барлық активті batch-тардың статусын тексеру"""
    active = load_active()
    
    if not active:
        print("📭 Активті batch жоқ")
        return
    
    client = get_client()
    
    for batch_id, info in list(active.items()):
        try:
            batch = client.messages.batches.retrieve(batch_id)
            
            print(f"\n📦 Batch: {batch_id}")
            print(f"   Status: {batch.processing_status}")
            print(f"   Tasks: {info['task_count']}")
            
            if hasattr(batch, 'request_counts'):
                rc = batch.request_counts
                print(f"   Progress: {rc.succeeded + rc.errored}/{rc.processing + rc.succeeded + rc.errored}")
            
            # Статусты жаңарту
            active[batch_id]["status"] = batch.processing_status
            
            if batch.processing_status == "ended":
                print(f"   ✅ Аяқталды! 'python batch_runner.py results' деп нәтижені алыңыз")
                
        except Exception as e:
            print(f"❌ {batch_id}: {e}")
    
    save_active(active)


def get_results():
    """Аяқталған batch нәтижелерін алу"""
    active = load_active()
    client = get_client()
    
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    
    for batch_id, info in list(active.items()):
        try:
            batch = client.messages.batches.retrieve(batch_id)
            
            if batch.processing_status != "ended":
                print(f"⏳ {batch_id}: әлі өңделуде ({batch.processing_status})")
                continue
            
            print(f"\n📥 Нәтижелер алынуда: {batch_id}")
            
            # Нәтижелерді алу
            results = []
            for result in client.messages.batches.results(batch_id):
                results.append({
                    "custom_id": result.custom_id,
                    "type": result.result.type,
                    "content": result.result.message.content[0].text if result.result.type == "succeeded" else None,
                    "error": str(result.result.error) if result.result.type == "errored" else None
                })
            
            # Файлға сақтау
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            result_file = RESULTS_DIR / f"{timestamp}_{batch_id[:8]}.json"
            
            with open(result_file, "w") as f:
                json.dump({
                    "batch_id": batch_id,
                    "completed_at": datetime.now().isoformat(),
                    "results": results
                }, f, indent=2, ensure_ascii=False)
            
            print(f"   ✅ Сақталды: {result_file.name}")
            print(f"   Нәтижелер: {len(results)}")
            
            # Summary көрсету
            for r in results:
                status = "✅" if r["type"] == "succeeded" else "❌"
                preview = r["content"][:100] + "..." if r["content"] and len(r["content"]) > 100 else r["content"]
                print(f"\n   {status} {r['custom_id']}:")
                if r["content"]:
                    print(f"      {preview}")
                if r["error"]:
                    print(f"      Error: {r['error']}")
            
            # Активтен өшіру
            del active[batch_id]
            
        except Exception as e:
            print(f"❌ {batch_id}: {e}")
    
    save_active(active)


def list_pending():
    """Pending тапсырмаларды көрсету"""
    tasks = load_tasks()
    
    if not tasks:
        print("📭 Pending тапсырма жоқ")
        return
    
    print(f"📋 Pending тапсырмалар ({len(tasks)}):\n")
    for t in tasks:
        model = t["params"]["model"].split("-")[1]  # claude-sonnet -> sonnet
        preview = t["params"]["messages"][0]["content"][:60]
        print(f"  • [{t['custom_id']}] ({model})")
        print(f"    {preview}...")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    cmd = sys.argv[1]
    
    if cmd == "add":
        if len(sys.argv) < 3:
            print("❌ Тапсырма мәтінін енгізіңіз")
            print("   python batch_runner.py add 'тапсырма мәтіні'")
            return
        
        prompt = sys.argv[2]
        custom_id = None
        model = DEFAULT_MODEL
        
        # Parse optional args
        i = 3
        while i < len(sys.argv):
            if sys.argv[i] == "--id" and i + 1 < len(sys.argv):
                custom_id = sys.argv[i + 1]
                i += 2
            elif sys.argv[i] == "--model" and i + 1 < len(sys.argv):
                model = sys.argv[i + 1]
                i += 2
            else:
                i += 1
        
        add_task(prompt, custom_id, model)
        
    elif cmd == "list":
        list_pending()
        
    elif cmd == "submit":
        submit_batch()
        
    elif cmd == "status":
        check_status()
        
    elif cmd == "results":
        get_results()
        
    else:
        print(f"❌ Белгісіз команда: {cmd}")
        print(__doc__)


if __name__ == "__main__":
    main()
