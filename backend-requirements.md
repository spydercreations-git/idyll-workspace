# Backend API Requirements for Idyll Productions

## Technology Stack Recommendations

### **Option 1: Node.js + Express (Recommended)**
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **WebSockets**: Socket.io
- **Authentication**: JWT + bcrypt
- **Hosting**: Railway, Render, or Heroku

### **Option 2: Supabase (Easiest)**
- **Database**: PostgreSQL (built-in)
- **Authentication**: Built-in auth system
- **Real-time**: Built-in WebSocket subscriptions
- **API**: Auto-generated REST + GraphQL APIs
- **Hosting**: Fully managed

## Required API Endpoints

### **Authentication**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### **Users**
```
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### **Applications**
```
GET    /api/applications
POST   /api/applications
PUT    /api/applications/:id/approve
PUT    /api/applications/:id/reject
DELETE /api/applications/:id
```

### **Tasks**
```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/tasks/user/:userId
```

### **Meetings**
```
GET    /api/meetings
POST   /api/meetings
PUT    /api/meetings/:id
DELETE /api/meetings/:id
```

### **Payouts**
```
GET    /api/payouts
POST   /api/payouts
PUT    /api/payouts/:id
GET    /api/payouts/user/:userId
```

### **Chat**
```
GET    /api/chat/messages
POST   /api/chat/messages
WebSocket: /ws/chat
```

### **Notifications**
```
GET    /api/notifications
POST   /api/notifications
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id
```

## WebSocket Events

### **Chat System**
```javascript
// Client to Server
socket.emit('join_room', { userId, role });
socket.emit('send_message', { message, sender });

// Server to Client
socket.on('new_message', { message, sender, timestamp });
socket.on('user_joined', { user });
socket.on('user_left', { user });
```

### **Real-time Updates**
```javascript
// Task updates
socket.on('task_updated', { taskId, updates });
socket.on('task_created', { task });

// Payout updates
socket.on('payout_updated', { payoutId, status });

// Notifications
socket.on('new_notification', { notification });
```

## Database Hosting Options

### **1. Supabase (Recommended for MVP)**
- **Pros**: Easy setup, built-in auth, real-time, generous free tier
- **Cons**: Vendor lock-in
- **Cost**: Free tier: 500MB, 2 CPU hours
- **Setup**: 5 minutes

### **2. Railway**
- **Pros**: Simple deployment, PostgreSQL included
- **Cons**: Paid service
- **Cost**: ~$5-20/month
- **Setup**: 10 minutes

### **3. Neon**
- **Pros**: Serverless PostgreSQL, generous free tier
- **Cons**: Need separate backend hosting
- **Cost**: Free tier: 3GB storage
- **Setup**: 15 minutes

### **4. PlanetScale**
- **Pros**: MySQL, branching, good free tier
- **Cons**: MySQL instead of PostgreSQL
- **Cost**: Free tier: 1 database, 1GB storage
- **Setup**: 10 minutes

## Deployment Steps

### **For Netlify Frontend:**
1. Connect GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### **For Backend (if using Node.js):**
1. Deploy to Railway/Render/Heroku
2. Set up PostgreSQL database
3. Configure environment variables
4. Run database migrations

### **For Supabase (Easiest):**
1. Create Supabase project
2. Run SQL schema in Supabase SQL editor
3. Get API keys and database URL
4. Update frontend to use Supabase client

## Security Considerations

1. **CORS**: Configure proper CORS for your Netlify domain
2. **Rate Limiting**: Implement API rate limiting
3. **Input Validation**: Validate all inputs server-side
4. **SQL Injection**: Use parameterized queries
5. **Authentication**: Secure JWT implementation
6. **HTTPS**: Ensure all communications are encrypted