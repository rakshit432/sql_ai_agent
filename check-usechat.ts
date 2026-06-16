// check-usechat.ts
import * as aiReact from '@ai-sdk/react';

console.log("Exports from @ai-sdk/react:", Object.keys(aiReact));

// We can't actually call useChat outside a React component easily without rendering, 
// but we can look at the type if we use tsc or just look at package.json exactly.
