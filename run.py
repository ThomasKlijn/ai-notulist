#!/usr/bin/env python3
import subprocess
import os
import time

def main():
    # Change to web directory
    os.chdir('web')
    
    # Start Next.js development server
    print("Starting Next.js development server...")
    subprocess.run(['npm', 'run', 'dev'], check=True)

if __name__ == "__main__":
    main()