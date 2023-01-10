import { TabItem } from "../models/common";

export const MIME_TYPES: Record<string, string> = {
  css: "text/css",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/vnd.microsoft.icon",
  jar: "application/java-archive",
  jpeg: "image/jpeg",
  jpg: "image/jpg",
  js: "text/javascript",
  ts: "application/x-typescript",
  json: "application/json",
  mp3: "audio/mpeg",
  odt: "application/vnd.oasis.opendocument.text",
  png: "image/png",
  pdf: "application/pdf",
  php: "application/x-httpd-php",
  ppt: "application/vnd.ms-powerpoint",
  rar: "application/vnd.rar",
  rtf: "application/rtf",
  sh: "application/x-sh",
  svg: "image/svg+xml",
  wav: "audio/wav",
  webm: "video/webm",
  xhtml: "application/xhtml+xml",
  xls: "application/vnd.ms-excel",
  zip: "application/zip",
  xml: "text/xml",
  txt: "text/plain",
  mp4: "video/mp4"
};

export const MIME_TYPE_ICONS: Record<string, string> = {
  "text/css": "mdi-language-css3",
  "text/csv": "mdi-file-delimited",
  "application/msword": "mdi-file-word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "mdi-file-word",
  "image/gif": "mdi-file-gif-box",
  "text/html": "mdi-language-html5",
  "image/vnd.microsoft.icon": "mdi-emoticon",
  "application/java-archive": "mdi-language-java",
  "image/jpeg": "mdi-file-jpg-box",
  "image/jpg": "mdi-file-jpg-box",
  "text/javascript": "mdi-language-javascript",
  "application/x-typescript": "mdi-language-typescript",
  "application/json": "mdi-code-json",
  "audio/mpeg": "mdi-file-music",
  "application/vnd.oasis.opendocument.text": "mdi-text-box",
  "image/png": "mdi-file-image",
  "application/pdf": "mdi-file-pdf-box",
  "application/x-httpd-php": "mdi-language-php",
  "application/vnd.ms-powerpoint": "mdi-file-powerpoint",
  "application/vnd.rar": "mdi-archive",
  "application/rtf": "mdi-text-box",
  "application/x-sh": "mdi-bash",
  "image/svg+xml": "mdi-svg",
  "audio/wav": "mdi-file-music",
  "video/webm": "mdi-file-video",
  "application/xhtml+xml": "mdi-language-html5",
  "application/vnd.ms-excel": "mdi-file-excel",
  "application/zip": "mdi-archive",
  "text/xml": "mdi-xml",
  "text/plain": "mdi-text-box",
  "video/mp4": "mdi-file-video"
};

export const LANGUAGES = {
  ENGLISH: "en",
  CROATIAN: "hr"
};

export const TABS = {
  UPLOADS: 1,
  OBJECTS: 2,
  IMAGES: 3,
  TEXT: 4,
  VIDEOS: 5,
  AUDIO: 6
};

export const TAB_ITEMS: Record<number, TabItem> = {
  [TABS.UPLOADS]: {
    value: TABS.UPLOADS,
    name: "Uploads",
    image: "uploads"
  },
  [TABS.OBJECTS]: {
    value: TABS.OBJECTS,
    name: "Objects",
    image: "shape"
  },
  [TABS.IMAGES]: {
    value: TABS.IMAGES,
    name: "Images",
    image: "image"
  },
  [TABS.TEXT]: {
    value: TABS.TEXT,
    name: "Text",
    image: "text"
  },
  [TABS.VIDEOS]: {
    value: TABS.VIDEOS,
    name: "Videos",
    image: "video"
  },
  [TABS.AUDIO]: {
    value: TABS.AUDIO,
    name: "Audio",
    image: "audio"
  }
};

export const EMOJIS = [
  "bomb-emoji",
  "cat-face-emoji",
  "clap-emoji",
  "clock-emoji",
  "construction-emoji",
  "crying-emoji",
  "dog-face-emoji",
  "eyes-emoji",
  "fire-emoji",
  "gem-emoji",
  "ghost-emoji",
  "gift-emoji",
  "graph-emoji",
  "heart-eyes-emoji",
  "heart-kiss-emoji",
  "hundred-100-points-emoji",
  "laughing-emoji",
  "mindblown-emoji",
  "money-emoji",
  "moon-emoji",
  "nail-polish-emoji",
  "party-popper-emoji",
  "pencil-emoji",
  "pizza-emoji",
  "plane-emoji",
  "pleading-face-emoji",
  "point-emoji",
  "praying-hands-emoji",
  "raising-hands-emoji",
  "rocket-emoji",
  "rose-emoji",
  "skull-emoji",
  "smiling-emoji",
  "sparkles-emoji",
  "star-emoji",
  "sun-emoji",
  "sunglasses-cool-emoji",
  "surprised-emoji",
  "target-emoji",
  "thinking-face-emoji",
  "thought-balloon-emoji",
  "thumbs-up-emoji",
  "tongue-emoji",
  "trophy-emoji",
  "tulip-emoji",
  "wave-emoji",
  "winking-face-emoji",
  "wip-emoji"
];

export const SHAPES = [
  "arrow",
  "circle",
  "heart",
  "hexagon",
  "polygon",
  "rectangle",
  "star",
  "triangle"
];

export const AUDIO = [
  "epic-cinematic-trailer",
  "everything-feels-new",
  "inspirational-background",
  "lofi",
  "stomping-rock",
  "the-podcast-intro",
  "tropical-summer-music"
];
