#![allow(non_snake_case)]
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::path::Path;
use std::env;
use std::process::Command;
use std::fs;

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

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet, convert, save])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
