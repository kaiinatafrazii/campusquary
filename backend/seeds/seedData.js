const dotenv = require('dotenv');
dotenv.config();

const { connectDB, sequelize } = require('../config/db');
const { User } = require('../models/User');
const { Question } = require('../models/Question');
const { Answer } = require('../models/Answer');
const { Tag } = require('../models/Tag');

async function seed() {
  console.log('🌱 Seeding CampusQuery SQL Knowledge Base...');
  await connectDB();

  // Clear existing records from SQL tables
  console.log('Clearing existing SQL records...');
  await Answer.destroy({ where: {}, truncate: false });
  await Question.destroy({ where: {}, truncate: false });
  await Tag.destroy({ where: {}, truncate: false });
  await User.destroy({ where: {}, truncate: false });

  // 1. Create Default Users
  console.log('Creating users in SQL (Admin, Faculty, Students)...');

  const admin = await User.create({
    name: 'Dr. Rajesh Sharma',
    email: 'admin@campus.edu',
    password: 'password123',
    role: 'admin',
    rollNo: 'FAC-001',
    branch: 'Computer Science & Engineering',
    semester: 'Staff',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RajeshSharma',
    reputation: 350,
    badges: ['Campus Admin', 'HOD CSE', 'Elite Mentor']
  });

  const faculty = await User.create({
    name: 'Prof. Ananya Gupta',
    email: 'faculty@campus.edu',
    password: 'password123',
    role: 'faculty',
    rollNo: 'FAC-042',
    branch: 'Information Technology',
    semester: 'Staff',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnanyaGupta',
    reputation: 280,
    badges: ['Verified Faculty', 'Algorithm Specialist', 'Top Solution Provider']
  });

  const student1 = await User.create({
    name: 'Arjun Verma',
    email: 'student@campus.edu',
    password: 'password123',
    role: 'student',
    rollNo: '2022-CSE-045',
    branch: 'Computer Science & Engineering',
    semester: '6th Semester',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ArjunVerma',
    reputation: 165,
    badges: ['Senior Scholar', 'Code Contributor', 'DBMS Ace']
  });

  const student2 = await User.create({
    name: 'Priya Nair',
    email: 'priya@campus.edu',
    password: 'password123',
    role: 'student',
    rollNo: '2023-IT-018',
    branch: 'Information Technology',
    semester: '4th Semester',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PriyaNair',
    reputation: 95,
    badges: ['Active Contributor', 'Network Navigator']
  });

  const student3 = await User.create({
    name: 'Rohit Mehra',
    email: 'rohit@campus.edu',
    password: 'password123',
    role: 'student',
    rollNo: '2022-CSE-091',
    branch: 'Computer Science & Engineering',
    semester: '6th Semester',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RohitMehra',
    reputation: 60,
    badges: ['Web Developer', 'Bug Hunter']
  });

  // 2. Create Tags
  console.log('Creating subject tags in SQL...');
  const tagsData = [
    { name: 'graph-theory', subject: 'Graph Theory', description: 'Graphs, trees, shortest paths, spanning trees and network flow', questionCount: 1 },
    { name: 'dijkstra', subject: 'Graph Theory', description: 'Single-source shortest path algorithm for non-negative edge weights', questionCount: 1 },
    { name: 'cn', subject: 'Computer Networks', description: 'Computer networking protocols, TCP/IP stack, routing and security', questionCount: 1 },
    { name: 'tcp-ip', subject: 'Computer Networks', description: 'Transmission Control Protocol and Internet Protocol handshake, flow and congestion control', questionCount: 1 },
    { name: 'dbms', subject: 'DBMS', description: 'Relational databases, SQL, normalization, transactions and indexing', questionCount: 1 },
    { name: 'b-plus-tree', subject: 'DBMS', description: 'Self-balancing n-ary tree data structure used for file storage and index blocks in DBMS', questionCount: 1 },
    { name: 'web-programming', subject: 'Web Programming', description: 'Full stack web development, React, Node.js, REST APIs and frontend architectures', questionCount: 1 },
    { name: 'react', subject: 'Web Programming', description: 'Declarative component-based UI library with virtual DOM and hooks', questionCount: 1 },
    { name: 'os', subject: 'Operating Systems', description: 'Process synchronization, CPU scheduling, memory management and deadlocks', questionCount: 1 },
    { name: 'deadlock', subject: 'Operating Systems', description: 'Resource allocation graphs, Banker algorithm, safety checks and recovery', questionCount: 1 },
    { name: 'algorithms', subject: 'Algorithms & DSA', description: 'Time & space complexities, dynamic programming, divide & conquer and greedy techniques', questionCount: 1 }
  ];

  for (const t of tagsData) {
    await Tag.create(t);
  }

  // 3. Create Questions & Answers
  console.log('Seeding academic questions & answers into SQL tables...');

  // Q1: Graph Theory (Dijkstra)
  const q1 = await Question.create({
    title: "Why does Dijkstra's Algorithm fail with negative edge weights? Can we fix it by adding a constant weight?",
    description: `During our Graph Theory lecture today, Sir mentioned that **Dijkstra's algorithm** does not work if there are negative edge weights in the directed graph.

A student suggested:
> *"Why can't we simply find the minimum negative edge $-W$, add $W$ to every single edge in the graph so all weights become non-negative, and then run standard Dijkstra?"*

Why is this heuristic mathematically incorrect? Does this change the shortest path? Could someone provide a concrete counterexample?`,
    subject: 'Graph Theory',
    tags: ['graph-theory', 'dijkstra', 'algorithms'],
    authorId: student1._id,
    authorName: student1.name,
    authorRole: student1.role,
    authorAvatar: student1.avatar,
    views: 84,
    upvotes: [String(student2._id), String(student3._id), String(admin._id)],
    downvotes: [],
    voteScore: 3,
    answersCount: 1,
    hasAcceptedAnswer: true,
    isPinned: true
  });

  const a1 = await Answer.create({
    questionId: q1._id,
    authorId: faculty._id,
    authorName: faculty.name,
    authorRole: faculty.role,
    authorAvatar: faculty.avatar,
    authorReputation: faculty.reputation,
    authorBranch: faculty.branch,
    content: `Great question! This is a classic doubt in Graph Theory & Algorithm Design.

### Why adding a constant weight $W$ fails:

When you add a positive constant $W$ to **every edge**, paths that contain **more edges** are penalized disproportionately compared to paths with **fewer edges**.

#### Counterexample:
Suppose we want to find the shortest path from **$A$ to $C$**:
- **Path 1**: $A \\to C$ (1 edge) with weight = $5$
- **Path 2**: $A \\to B \\to C$ (2 edges) with weights $A \\to B = 10$, $B \\to C = -7$.
  - Total original weight of Path 2: $10 + (-7) = 3$.

Here, **Path 2 is the true shortest path** ($3 < 5$).

Now suppose we find the most negative weight is $-7$. So we add $W = 7$ to every edge:
- **New Path 1**: $A \\to C$ (1 edge) has weight $5 + 7 = \\mathbf{12}$.
- **New Path 2**: $A \\to B$ ($10 + 7 = 17$), $B \\to C$ ($-7 + 7 = 0$).
  - Total modified weight of Path 2: $17 + 0 = \\mathbf{17}$.

Notice what happened:
- Under modified weights, Dijkstra chooses **Path 1 (weight 12)** instead of **Path 2 (weight 17)**!
- The algorithm produces the **wrong shortest path** because adding $W$ added $1 \\times W$ to Path 1, but added $2 \\times W$ to Path 2!

### Correct Solution for Negative Weights:
Use the **Bellman-Ford Algorithm** ($O(V \\cdot E)$) or, if reweighting is strictly needed for all-pairs shortest paths, use **Johnson's Algorithm**, which uses vertex potentials $h(u)$ instead of a simple constant.`,
    upvotes: [String(student1._id), String(student2._id), String(admin._id)],
    downvotes: [],
    voteScore: 3,
    isAccepted: true,
    isFacultyEndorsed: true
  });

  // Q2: Computer Networks (TCP 3-Way Handshake)
  const q2 = await Question.create({
    title: 'Why does TCP use a 3-Way Handshake instead of a 2-Way Handshake?',
    description: `We are studying the Transport Layer in Computer Networks (CN). Why is a **3-Way Handshake** strictly required to establish a connection? 

What catastrophe or resource leak happens if the client and server only used a **2-Way Handshake** (Client sends SYN, Server sends SYN-ACK and establishes connection immediately)?`,
    subject: 'Computer Networks',
    tags: ['cn', 'tcp-ip'],
    authorId: student2._id,
    authorName: student2.name,
    authorRole: student2.role,
    authorAvatar: student2.avatar,
    views: 62,
    upvotes: [String(student1._id), String(faculty._id)],
    downvotes: [],
    voteScore: 2,
    answersCount: 1,
    hasAcceptedAnswer: true,
    isPinned: false
  });

  const a2 = await Answer.create({
    questionId: q2._id,
    authorId: student1._id,
    authorName: student1.name,
    authorRole: student1.role,
    authorAvatar: student1.avatar,
    authorReputation: student1.reputation,
    authorBranch: student1.branch,
    content: `The primary reason TCP uses a 3-way handshake rather than a 2-way handshake is to **prevent delayed or duplicate duplicate SYN segments from establishing ghost connections and wasting server resources**.

### The Problem with a 2-Way Handshake:

\`\`\`text
Client                            Server
  |                                  |
  |--- SYN (Delayed in network) ---->| (Stuck in router queue)
  |                                  |
  |--- Client times out & retries -->|
  |--- SYN (New) ------------------->|
  |<-- SYN-ACK ----------------------| Connection 1 established & closed
  |                                  |
  |                                  |
  | (Much later, Old SYN arrives)    |
  |--------------------------------->| Server receives Old Delayed SYN!
  |<-- SYN-ACK ----------------------| Server opens connection, allocates buffers!
\`\`\`

With a **2-way handshake**:
1. When the delayed old SYN finally arrives at the server, the server assumes a fresh connection request has arrived.
2. The server sends back SYN-ACK and **immediately moves to the ESTABLISHED state**, allocating socket buffers, memory, and sequence numbers.
3. However, the Client has already discarded that session and will ignore the ACK!
4. Result: The server holds a **half-open phantom connection forever**, leading to a severe Denial of Service (DoS) vulnerability.

### Why 3-Way Handshake fixes it:
With 3 packets:
1. Client $\\to$ Server: \`SYN (seq=x)\`
2. Server $\\to$ Client: \`SYN-ACK (seq=y, ack=x+1)\`
3. Client $\\to$ Server: \`ACK (ack=y+1)\`

Only upon receiving the **3rd packet (ACK)** does the Server open and establish the session. If the client receives a SYN-ACK for an old duplicate, it sends a \`RST\` (Reset) flag, terminating the invalid connection immediately!`,
    upvotes: [String(student2._id), String(faculty._id)],
    downvotes: [],
    voteScore: 2,
    isAccepted: true,
    isFacultyEndorsed: false
  });

  // Q3: DBMS (B+ Tree vs Hash Index)
  const q3 = await Question.create({
    title: 'When to prefer B+ Tree index over Hash index in relational databases (MySQL / PostgreSQL)?',
    description: `In our DBMS lab on indexing, Hash Index has $O(1)$ average search time while B+ Tree has $O(\\log_B N)$.

Since $O(1)$ is theoretically faster than $O(\\log N)$, why do all mainstream relational DBMS (like MySQL InnoDB, PostgreSQL) use **B+ Tree as the default index** instead of Hash Index? Under what conditions is Hash indexing actually preferred?`,
    subject: 'DBMS',
    tags: ['dbms', 'b-plus-tree'],
    authorId: student3._id,
    authorName: student3.name,
    authorRole: student3.role,
    authorAvatar: student3.avatar,
    views: 45,
    upvotes: [String(student1._id)],
    downvotes: [],
    voteScore: 1,
    answersCount: 1,
    hasAcceptedAnswer: true,
    isPinned: false
  });

  const a3 = await Answer.create({
    questionId: q3._id,
    authorId: student2._id,
    authorName: student2.name,
    authorRole: student2.role,
    authorAvatar: student2.avatar,
    authorReputation: student2.reputation,
    authorBranch: student2.branch,
    content: `Even though Hash indexing gives theoretical $O(1)$ lookup for exact equality, real-world database queries are rarely just \`WHERE id = 5\`.

### Why B+ Trees are superior in RDBMS:

1. **Range Queries & Comparisons**:
   - Queries with \`>\`, \`<\`, \`BETWEEN\`, \`>=\`, or \`<=\` cannot use Hash indexes because hashes scramble sequential ordering.
   - In B+ Trees, all leaf nodes are connected via a **doubly-linked list**. Once you find the lower bound in $O(\\log N)$, you simply traverse the linked list!

2. **Sorting (\`ORDER BY\`) & Grouping (\`GROUP BY\`)**:
   - B+ Trees store keys in sorted order. If you query \`ORDER BY marks DESC\`, the engine reads the index sequentially without any extra sorting step in memory.

3. **Prefix / Wildcard Matches**:
   - \`WHERE name LIKE 'Arjun%'\` works efficiently on B+ Trees, but completely fails on Hash indexes.

4. **Disk I/O Efficiency**:
   - B+ Trees have a very high branching factor (fanout $B \\approx 100-1000$). A tree of depth 3 or 4 can index millions of rows with only 3 to 4 disk page reads!

### When to use Hash Index:
- Pure key-value caches (like Redis, Memcached).
- Columns where you **strictly** execute point queries: \`WHERE session_token = 'xyz123'\`.`,
    upvotes: [String(student3._id), String(admin._id)],
    downvotes: [],
    voteScore: 2,
    isAccepted: true,
    isFacultyEndorsed: true
  });

  // Q4: Web Programming
  const q4 = await Question.create({
    title: 'Understanding React Server Components (RSC) vs Client Components and Hydration in Next.js',
    description: `Can someone break down what **hydration** actually means in modern Web Programming with React? Also, what is the key difference between Server Components and traditional Client Components marked with \`"use client"\`?

Need a clear explanation for our end-semester viva!`,
    subject: 'Web Programming',
    tags: ['web-programming', 'react'],
    authorId: student1._id,
    authorName: student1.name,
    authorRole: student1.role,
    authorAvatar: student1.avatar,
    views: 53,
    upvotes: [String(student2._id), String(student3._id)],
    downvotes: [],
    voteScore: 2,
    answersCount: 0,
    hasAcceptedAnswer: false,
    isPinned: false
  });

  // Q5: Operating Systems
  const q5 = await Question.create({
    title: "How does Banker's Algorithm ensure deadlock avoidance during runtime?",
    description: `We are studying deadlock avoidance in Operating Systems. If a system is in an unsafe state, does that guarantee a deadlock will happen? How does the resource allocation graph check compare against Banker's Algorithm when multiple instances of resources exist?`,
    subject: 'Operating Systems',
    tags: ['os', 'deadlock'],
    authorId: student2._id,
    authorName: student2.name,
    authorRole: student2.role,
    authorAvatar: student2.avatar,
    views: 39,
    upvotes: [String(admin._id)],
    downvotes: [],
    voteScore: 1,
    answersCount: 0,
    hasAcceptedAnswer: false,
    isPinned: false
  });

  console.log('✅ SQL Database Seed Data successfully generated!');
  console.log('Credentials:');
  console.log(' - Admin:   admin@campus.edu   / password123');
  console.log(' - Faculty: faculty@campus.edu / password123');
  console.log(' - Student: student@campus.edu / password123');
}

if (require.main === module) {
  seed().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;
