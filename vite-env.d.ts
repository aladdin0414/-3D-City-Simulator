// Fix: Commented out vite/client reference as the type definition is missing in the environment.
// /// <reference types="vite/client" />

// Manual asset declarations to replace vite/client functionality if needed
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}
