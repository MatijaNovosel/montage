import { SelectItem, TabItem } from "@/models/common";

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
  AUDIO: 6,
  SETTINGS: 7
};

export const TAB_ITEMS: Record<number, TabItem> = {
  [TABS.UPLOADS]: {
    value: TABS.UPLOADS,
    name: "Uploads",
    icon: "cloud-upload"
  },
  [TABS.OBJECTS]: {
    value: TABS.OBJECTS,
    name: "Objects",
    icon: "circle-multiple"
  },
  [TABS.IMAGES]: {
    value: TABS.IMAGES,
    name: "Images",
    icon: "image"
  },
  [TABS.TEXT]: {
    value: TABS.TEXT,
    name: "Text",
    icon: "format-text"
  },
  [TABS.VIDEOS]: {
    value: TABS.VIDEOS,
    name: "Videos",
    icon: "video"
  },
  [TABS.AUDIO]: {
    value: TABS.AUDIO,
    name: "Audio",
    icon: "music-note"
  },
  [TABS.SETTINGS]: {
    value: TABS.SETTINGS,
    name: "Settings",
    icon: "cogs"
  }
};

export const EMOJIS = [
  "neutral",
  "devil",
  "nerd",
  "thinking",
  "rock",
  "clown",
  "sick",
  "laugh",
  "facepalm",
  "raised-eyebrow",
  "shrug",
  "yawn",
  "cry",
  "hot",
  "freeze",
  "groncho",
  "bait",
  "disco",
  "hand",
  "point",
  "alert",
  "blitz",
  "raised-finger",
  "fist",
  "wave"
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

export const IMAGES = ["drunkDriving", "redPill", "pizzaHat"];

export const VIDEOS = ["cats"];

export const SIZES = ["b", "kB", "MB", "GB", "TB"];

export const ALIGN_OPTIONS: Record<string, number> = {
  TOP: 1,
  CENTER_V: 2,
  BOTTOM: 3,
  LEFT: 4,
  CENTER_H: 5,
  RIGHT: 6
};

export const TIME_OPTIONS: SelectItem<number>[] = [
  {
    title: "0.5x",
    value: 1
  },
  {
    title: "1x",
    value: 2
  },
  {
    title: "1.5x",
    value: 3
  },
  {
    title: "2x",
    value: 4
  }
];

export const SNAP_CHECK_DIRECTION: Record<string, number> = {
  MIDDLE: 1,
  BOTTOM: 2,
  TOP: 3
};

export const LAYER_TYPE: Record<string, string> = {
  IMAGE: "image",
  TEXT: "text",
  EMOJI: "emoji",
  SHAPE: "shape",
  VIDEO: "video",
  UPLOAD: "upload"
};

export const LAYER_TYPE_ICON: Record<string, string> = {
  [LAYER_TYPE.IMAGE]: "🖼️",
  [LAYER_TYPE.TEXT]: "✏️",
  [LAYER_TYPE.VIDEO]: "🎥"
};

export const LAYER_TYPE_COLOR: Record<string, string> = {
  [LAYER_TYPE.IMAGE]: "blue",
  [LAYER_TYPE.TEXT]: "pink",
  [LAYER_TYPE.VIDEO]: "orange"
};

export const FILE_SIZE_LIMIT = 10_485_760; // 10 MB

export const DEFAULT_DURATION = 10_000; // 10 seconds

export const DRAWER_WIDTH = 480;
export const LAYOUT_WIDTH = 380;
