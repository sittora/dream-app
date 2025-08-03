# Dream Journal Database

## Overview

The Dream Journal uses a **SQLite database** with **Drizzle ORM** for reliable and secure dream storage. The database is designed with modern security practices and optimal performance.

## 🗄️ Database Features

### **Security & Reliability**

- ✅ **SQLite with WAL mode** - Atomic transactions and crash recovery
- ✅ **Foreign key constraints** - Data integrity protection
- ✅ **Input validation** - Prevents SQL injection and invalid data
- ✅ **Encrypted storage** - Sensitive data protection
- ✅ **Backup support** - Automatic database backups

### **Performance Optimizations**

- ✅ **Indexed symbols** - Fast dream searching by symbols
- ✅ **Optimized queries** - Efficient dream retrieval
- ✅ **Connection pooling** - Better resource management
- ✅ **Caching layer** - Reduced database load

## 📊 Database Schema

### **Core Tables**

#### `users` - User Accounts

```sql
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password_hash (ENCRYPTED)
- profile_image
- bio
- mfa_secret
- mfa_enabled
- points
- level
- rank
- created_at
- updated_at
```

#### `dreams` - Dream Entries

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- title
- content
- mood
- visibility (public/private)
- interpretation
- likes
- saves
- shares
- views
- created_at
- updated_at
```

#### `dream_symbols` - Dream Symbols

```sql
- id (PRIMARY KEY)
- dream_id (FOREIGN KEY)
- symbol
- meaning
- archetype
- alchemical_stage
```

#### `engagement` - User Interactions

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- dream_id (FOREIGN KEY)
- type (like/save/share/view)
- created_at
```

## 🔧 Setup Instructions

### **1. Initialize Database**

```bash
npm run db:setup
```

### **2. Database Location**

- **File**: `./data/dreams.db`
- **Directory**: `./data/`
- **Permissions**: Read/write for application

### **3. Automatic Features**

- ✅ **Auto-creation** - Database created on first dream save
- ✅ **Auto-migration** - Schema updates applied automatically
- ✅ **Auto-optimization** - Performance tuning on startup
- ✅ **Auto-validation** - Data integrity checks

## 🛡️ Security Features

### **Data Protection**

- **Input Sanitization** - All user inputs are validated and sanitized
- **SQL Injection Prevention** - Parameterized queries only
- **XSS Protection** - Content encoding and validation
- **Access Control** - User-specific dream visibility

### **Privacy Controls**

- **Private Dreams** - Only visible to the author
- **Public Dreams** - Visible to all users
- **Symbol Privacy** - Symbols are anonymized in public views
- **User Anonymity** - Optional anonymous posting

## 📈 Performance Features

### **Optimized Queries**

- **Symbol Search** - Fast hashtag-based dream discovery
- **Date Filtering** - Efficient calendar-based filtering
- **User Filtering** - Quick user-specific dream retrieval
- **Pagination** - Large dream lists load efficiently

### **Caching Strategy**

- **Dream Cache** - Frequently accessed dreams cached
- **Symbol Cache** - Popular symbols cached for fast lookup
- **User Cache** - User data cached for performance

## 🔍 Search & Discovery

### **Symbol-Based Search**

```javascript
// Find dreams by symbol
const dreams = await dreamService.getDreamsBySymbol("moon");
```

### **Multi-Filter Search**

```javascript
// Advanced search with multiple filters
const dreams = await dreamService.getDreams({
  userId: "user123",
  visibility: "public",
  symbol: "water",
  search: "ocean",
  limit: 20,
  offset: 0,
});
```

## 📊 Analytics & Insights

### **Dream Statistics**

- **Total Dreams** - Per user and globally
- **Symbol Frequency** - Most common dream symbols
- **Engagement Metrics** - Likes, shares, views
- **Trending Dreams** - Popular dream content

### **User Analytics**

- **Dream Streaks** - Consecutive days of dream recording
- **Symbol Patterns** - Recurring symbols in user's dreams
- **Engagement History** - User interaction patterns

## 🚀 Usage Examples

### **Save a New Dream**

```javascript
const newDream = await dreamService.createDream({
  userId: "user123",
  title: "Flying Over Mountains",
  content: "I was flying over snow-capped mountains...",
  mood: "excited",
  visibility: "private",
  symbols: ["flying", "mountains", "freedom"],
  interpretation: "This dream suggests a desire for freedom...",
});
```

### **Find Similar Dreams**

```javascript
// Find dreams with similar symbols
const similarDreams = await dreamService.getDreamsBySymbol("flying");
```

### **Like a Dream**

```javascript
const result = await dreamService.toggleLike("dream123", "user456");
// Returns: { liked: true, likes: 5 }
```

## 🔧 Maintenance

### **Database Health Checks**

```bash
# Check database integrity
npm run db:check

# Optimize database performance
npm run db:optimize

# Backup database
npm run db:backup
```

### **Monitoring**

- **Size Monitoring** - Database file size tracking
- **Performance Monitoring** - Query performance metrics
- **Error Logging** - Database error tracking
- **Usage Analytics** - Database usage patterns

## 🆘 Troubleshooting

### **Common Issues**

#### **Database Not Found**

```bash
# Recreate database
rm -rf ./data/dreams.db
npm run db:setup
```

#### **Performance Issues**

```bash
# Optimize database
npm run db:optimize

# Check integrity
npm run db:check
```

#### **Permission Errors**

```bash
# Fix permissions
chmod 644 ./data/dreams.db
chmod 755 ./data/
```

## 📚 API Reference

### **DreamService Methods**

```javascript
// Create dream
createDream(data: CreateDreamData): Promise<DreamWithSymbols>

// Get dreams with filters
getDreams(options: DreamFilters): Promise<DreamWithSymbols[]>

// Get single dream
getDreamById(dreamId: string, userId?: string): Promise<DreamWithSymbols | null>

// Update dream
updateDream(dreamId: string, userId: string, data: UpdateDreamData): Promise<DreamWithSymbols | null>

// Delete dream
deleteDream(dreamId: string, userId: string): Promise<boolean>

// Toggle like
toggleLike(dreamId: string, userId: string): Promise<{ liked: boolean; likes: number }>

// Get dreams by symbol
getDreamsBySymbol(symbol: string, limit?: number): Promise<DreamWithSymbols[]>
```

## 🎯 Best Practices

### **For Developers**

1. **Always validate input** before database operations
2. **Use transactions** for multi-table operations
3. **Handle errors gracefully** with proper logging
4. **Test database operations** thoroughly
5. **Monitor performance** regularly

### **For Users**

1. **Backup regularly** - Export your dream data
2. **Use meaningful symbols** - Better dream discovery
3. **Set appropriate visibility** - Control who sees your dreams
4. **Engage with community** - Like and share meaningful dreams

## 🔮 Future Enhancements

### **Planned Features**

- **Cloud Sync** - Automatic dream backup to cloud
- **Advanced Analytics** - Dream pattern analysis
- **AI Integration** - Enhanced dream interpretation
- **Social Features** - Dream sharing and collaboration
- **Mobile App** - Native mobile dream journaling

---

**✨ Your dreams are now securely stored and ready for exploration!**
