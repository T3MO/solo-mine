// Global type augmentations for third-party browser APIs

interface Window {
  plausible?: (
    event: string,
    options?: {
      props?: Record<string, string | number | boolean>;
      callback?: () => void;
    }
  ) => void;
}
