"""
Authentication utilities for password hashing and verification
"""
import hashlib
import secrets


def hash_password(password: str) -> str:
    """
    Hash a password using SHA-256 with a salt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password with salt (format: salt$hash)
    """
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${pwd_hash}"


def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a password against a hashed password.
    
    Args:
        password: Plain text password to verify
        hashed: Hashed password from database (format: salt$hash)
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        salt, pwd_hash = hashed.split('$')
        return hashlib.sha256((salt + password).encode()).hexdigest() == pwd_hash
    except (ValueError, AttributeError):
        return False
