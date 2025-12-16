#!/usr/bin/env python3
"""
Script to generate bcrypt password hashes for initial users
Run this locally before executing the SQL migration
"""

import bcrypt

# Passwords to hash
passwords = {
    "testepassword123": "tvindima@imoveismais.pt",
    "123456": "faturacao@imoveismais.pt and leiria@imoveismais.pt",
}

print("Password Hashes for SQL Migration:")
print("=" * 80)

for password, user in passwords.items():
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    hashed_str = hashed.decode('utf-8')
    
    print(f"\nPassword: {password}")
    print(f"User(s): {user}")
    print(f"Hash: {hashed_str}")
    print(f"\nSQL INSERT:")
    print(f"  hashed_password = '{hashed_str}'")

print("\n" + "=" * 80)
print("\nCopy the hashes above into migrate_add_users.sql")

