// This file is kept for compatibility but the actual user logic
// is handled through the database (SQL Server or SQLite)
// Users are authenticated via the database directly

class User {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || null;
    this.email = data.email || null;
    this.password = data.password || null;
    this.username = data.username || null;
    this.is_admin = data.is_admin || false;
  }

  // Methods remain empty as actual DB operations are in controllers
  static async findOne(query) {
    return null;
  }

  static async findById(id) {
    return null;
  }

  static async find() {
    return [];
  }

  async save() {
    return this;
  }
}

export default User;
