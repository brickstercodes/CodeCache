
import { CodeSnippet } from "@/types";

export const mockSnippets: CodeSnippet[] = [
  {
    id: "1",
    title: "React useState Hook Example",
    description: "A simple example of using the useState hook in React",
    code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Counter;`,
    language: "typescript",
    publisher: "reactdev",
    createdAt: "2023-09-15T10:30:00Z",
    updatedAt: "2023-09-15T10:30:00Z",
    tags: ["react", "hooks", "frontend"],
    ai_bio: "This snippet demonstrates the basic usage of the useState hook in React for managing component state."
  },
  {
    id: "2",
    title: "Python List Comprehension",
    description: "Using list comprehension for cleaner Python code",
    code: `# Without list comprehension
squares = []
for x in range(10):
    squares.append(x**2)
print(squares)

# With list comprehension
squares = [x**2 for x in range(10)]
print(squares)`,
    language: "python",
    publisher: "pythonista",
    createdAt: "2023-08-22T14:15:00Z",
    updatedAt: "2023-08-22T14:15:00Z",
    tags: ["python", "list", "comprehension"],
    ai_bio: "List comprehensions provide a concise way to create lists in Python, often replacing multi-line for loops."
  },
  {
    id: "3",
    title: "TypeScript Interface Example",
    description: "How to define and use interfaces in TypeScript",
    code: `interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

function createUser(user: User): User {
  return user;
}

// Using the interface
const newUser = createUser({
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  isActive: true
});

console.log(newUser);`,
    language: "typescript",
    publisher: "tsdev",
    createdAt: "2023-07-12T09:45:00Z",
    updatedAt: "2023-07-13T11:20:00Z",
    tags: ["typescript", "interface", "types"],
    ai_bio: "Interfaces in TypeScript provide a way to define the structure that objects must follow, enabling better type checking."
  },
  {
    id: "4",
    title: "JavaScript Promise Example",
    description: "Using promises for asynchronous operations",
    code: `function fetchData(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
}

// Using the promise
fetchData('https://api.example.com/data')
  .then(data => console.log('Data:', data))
  .catch(error => console.error('Error:', error));`,
    language: "javascript",
    publisher: "jsdev",
    createdAt: "2023-06-05T16:10:00Z",
    updatedAt: "2023-06-05T16:10:00Z",
    tags: ["javascript", "promises", "async"],
    ai_bio: "Promises represent the eventual completion or failure of an asynchronous operation and allow for cleaner handling of callbacks."
  },
  {
    id: "5",
    title: "CSS Flexbox Layout",
    description: "Common flexbox patterns for responsive layouts",
    code: `.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.item {
  flex: 1 1 300px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .item {
    flex: 1 1 100%;
  }
}`,
    language: "css",
    publisher: "cssdesigner",
    createdAt: "2023-05-18T13:25:00Z",
    updatedAt: "2023-05-19T09:15:00Z",
    tags: ["css", "flexbox", "responsive"],
    ai_bio: "Flexbox is a CSS layout module that makes it easier to design flexible responsive layout structures without using floats or positioning."
  },
  {
    id: "6",
    title: "Node.js Express Server Setup",
    description: "Basic Express.js server setup with middleware",
    code: `const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    language: "javascript",
    publisher: "nodedev",
    createdAt: "2023-04-22T11:40:00Z",
    updatedAt: "2023-04-22T11:40:00Z",
    tags: ["node", "express", "server", "backend"],
    ai_bio: "Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications."
  }
];
