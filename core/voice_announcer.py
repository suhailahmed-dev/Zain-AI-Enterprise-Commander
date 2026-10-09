import asyncio
import os
import subprocess
import sys
import edge_tts

AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
os.makedirs(AUDIO_DIR, exist_ok=True)

DEFAULT_VOICE = "ur-PK-UzmaNeural"

async def generate_speech_file(text: str, voice: str = DEFAULT_VOICE, output_path: str = None) -> str:
    if not output_path:
        output_path = os.path.join(AUDIO_DIR, "latest_announcement.mp3")
    communicate = edge_tts.Communicate(text, voice=voice)
    await communicate.save(output_path)
    return output_path

def play_audio(audio_path: str):
    ps_script = f"""
    Add-Type -AssemblyName presentationCore
    $player = New-Object System.Windows.Media.MediaPlayer
    $player.Open([System.Uri]"{audio_path}")
    Start-Sleep -Milliseconds 400
    $player.Play()
    Start-Sleep -Seconds 6
    $player.Close()
    """
    subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-Command", ps_script], capture_output=True)

def speak(text: str, voice: str = DEFAULT_VOICE):
    """Generates and speaks out text synchronously."""
    try:
        mp3_file = asyncio.run(generate_speech_file(text, voice))
        play_audio(mp3_file)
    except Exception as e:
        print(f"[Voice Error] {e}", file=sys.stderr)

if __name__ == "__main__":
    test_msg = sys.argv[1] if len(sys.argv) > 1 else "زین اے آئی انٹرپرائز کمانڈ سسٹم آن لائن ہے۔"
    print(f"Announcing: {test_msg}")
    speak(test_msg)
