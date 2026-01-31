# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## 🔥 ЕРЕЖЕ: Код жазу = Claude Code

**Код жазу керек болғанда — Claude Code қолдан!**

```bash
# Қысқа тапсырма
claude --print "тапсырма"

# Ұзын тапсырма (background)
claude "тапсырма" # PTY режимінде
```

**Неге:**
- Claude Code = менің код жазудағы көмекшім (ИИ агент)
- MAX тарифі — бөлек биллинг
- Менің токендерім үнемделеді

**Мен:**
- Координатор, жоспарлау, талдау
- Қысқа сұрақтар, жауаптар

**Claude Code:**
- Код жазу, файлдар жасау
- Рефакторинг, debugging
- Ұзын генерация

---

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
