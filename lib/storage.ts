import { z } from "zod";
import { LinkData } from "~/lib/constants";

const DB_NAME = "LinkTreeDB";
const STORE_NAME = "recent-links";
const DB_VERSION = 1;

const LinkDataSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  timestamp: z.number().int().positive(),
  pinned: z.boolean().optional(),
});

export async function initDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "url" });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addRecentLink(link: LinkData) {
  const validated = LinkDataSchema.parse(link);
  const db = await initDatabase();
  
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(validated);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRecentLinks(limit = 5) {
  const db = await initDatabase();
  
  return new Promise<LinkData[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("timestamp");
    const request = index.openCursor(null, "prev");

    const links: LinkData[] = [];
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && links.length < limit) {
        links.push(cursor.value);
        cursor.continue();
      } else {
        resolve(links);
      }
    };
    request.onerror = () => reject(request.error);
  });
}
