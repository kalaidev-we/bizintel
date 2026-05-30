import subprocess
import time
import urllib.request
import json
import sys

def test_server():
    print("Launching FastAPI server for verification check...")
    # Start uvicorn server in subprocess
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8085"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for server to boot
    time.sleep(4)
    
    try:
        print("Sending GET request to http://127.0.0.1:8085/ ...")
        # Try to read root endpoint
        response = urllib.request.urlopen("http://127.0.0.1:8085/", timeout=5)
        status_code = response.getcode()
        body = response.read().decode('utf-8')
        data = json.loads(body)
        
        print(f"Server responded with Status Code: {status_code}")
        print("Response Body:", data)
        
        if status_code == 200 and data.get("status") == "healthy":
            print("\n==========================================")
            print(" VERIFICATION SUCCESSFUL: FastAPI is healthy! ")
            print("==========================================\n")
            success = True
        else:
            print("Verification failed: Unexpected response format.")
            success = False
            
    except Exception as e:
        print("Verification failed: Could not connect or retrieve data.", e)
        success = False
    finally:
        # Shutdown server
        print("Terminating server process...")
        process.terminate()
        try:
            process.wait(timeout=5)
        except Exception:
            process.kill()
            
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    test_server()
