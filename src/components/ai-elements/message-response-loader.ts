type MessageResponseModule = typeof import("./message-response");

let rendererPromise: Promise<MessageResponseModule> | null = null;

export function preloadMessageResponse() {
  if (!rendererPromise) {
    rendererPromise = import("./message-response");
  }

  return rendererPromise;
}
