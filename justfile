# Set shell for Windows OSs:
# set windows-shell := ['cmd', '/c']
# set windows-shell := ["C:/Program Files/Git/usr/bin/bash.exe", "-c"]
set windows-shell := ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command"]

default: 
  just --list --unsorted

install:
	concurrently "cd svelte-app && pnpm install" "cd electron-app && pnpm install"

dev: 
  concurrently "cd svelte-app && pnpm run dev" "cd electron-app && pnpm run dev"

server: 
	concurrently "cd electron-app\db && pocketbase serve" "cd svelte-app && pnpm run start"

dev-frontend:
	concurrently "cd svelte-app && pnpm run dev"

build-win: full-svelte-win
	concurrently "cd electron-app && pnpm run build:win"

build-mac: full-svelte-mac
	concurrently "cd electron-app && pnpm run build:mac"

build-only-win: 
	concurrently "cd electron-app && pnpm run build:win"

build-only-mac: 
	concurrently "cd electron-app && pnpm run build:mac"

full-svelte-win: build-svelte prep-svelte move-svelte

full-svelte-mac: build-svelte prep-svelte move-svelte-mac

build-svelte:
  concurrently "cd svelte-app && pnpm run build"

prep-svelte:
	sd -F '/_app' './_app' svelte-app/build/index.html	

move-svelte:
	if (Test-Path "electron-app\out\renderer") { Remove-Item -Recurse -Force "electron-app\out\renderer" }; 
	New-Item -ItemType Directory -Force -Path "electron-app\out\renderer" | Out-Null; 
	Copy-Item -Path "svelte-app\build\*" -Destination "electron-app\out\renderer" -Recurse

move-svelte-mac:
	#!/usr/bin/env bash
	set -euxo pipefail # https://just.systems/man/en/chapter_44.html#safer-bash-shebang-recipes
	if [ -d "electron-app/out/renderer/" ]; then
		trash electron-app/out/renderer/
	fi
	mkdir -p electron-app/out/renderer
	cp -R svelte-app/build/* electron-app/out/renderer

publish:
    concurrently "cd electron-app && pnpm run publish"

gen-icon: 
    concurrently "cd electron-app\resources && magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico"
    