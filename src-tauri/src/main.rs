#![allow(non_snake_case)]
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::env;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

fn findIt<P>(exe_name: P) -> Option<PathBuf>
where
    P: AsRef<Path>,
{
    env::var_os("PATH").and_then(|paths| {
        env::split_paths(&paths)
            .filter_map(|dir| {
                let full_path = dir.join(&exe_name);
                if full_path.is_file() {
                    Some(full_path)
                } else {
                    None
                }
            })
            .next()
    })
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn convert(fileName: &str) -> Vec<String> {
    // ffmpeg -i output.webm -c copy -fflags +genpts video.mp4
    let dir = env::temp_dir();
    let in_dir = format!("{}{}", dir.display(), fileName);
    let out_dir = format!("{}video.mp4", dir.display());
    let b = Path::new(&in_dir).is_file();
    if b {
        let mut child = Command::new("ffmpeg.exe")
            .args(["-i", &in_dir, "-c", "copy", "-fflags", "+genpts", &out_dir])
            .spawn()
            .expect("failed to execute process");
        child.wait().expect("failed to wait on child");
        return vec![in_dir.into(), out_dir.into()];
    }
    return vec!["".to_string(), "".to_string()];
}

#[tauri::command]
fn save(convertedPath: &str, savePath: &str) -> () {
    fs::rename(convertedPath, savePath).expect("Could not rename");
}

#[tauri::command]
fn ffmpegInstalled() -> bool {
    return findIt("ffmpeg.exe") != None;
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            convert,
            save,
            ffmpegInstalled
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
