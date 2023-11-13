import pytest
import psycopg2
import os
import re

database_url = os.environ.get("SQLALCHEMY_DATABASE_URI")
if database_url.startswith("postgres://"):
    database_url = re.sub("^postgres://", "postgresql://", database_url)
connection = psycopg2.connect(database_url)


# Function to create a connection using DATABASE_URL from Heroku's environment variables
def get_connection():
    return psycopg2.connect(os.environ.get("SQLALCHEMY_DATABASE_URI"))

# Checks if the database is connected.
def test_postgres_connection():
    connection = None
    try:
        connection = get_connection()

        cursor = connection.cursor()
        # Print PostgreSQL Connection properties
        print(connection.get_dsn_parameters(), "\n")

        # Print PostgreSQL version
        cursor.execute("SELECT version();")
        record = cursor.fetchone()
        print("You are connected to - ", record, "\n")

    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        assert False  # This will fail the test if there's an error

    finally:
        # closing database connection.
        if connection:
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")

# Checks if 'users' table exists within the database.
def test_users_table_existence():
    connection = None
    try:
        connection = get_connection()

        cursor = connection.cursor()
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'users'
            );
        """)
        result = cursor.fetchone()
        assert result == (True,)

    finally:
        if connection:
            cursor.close()
            connection.close()

# Checks if 'email' column exists within the 'users' table.
def test_column_existence():
    connection = None
    try:
        connection = get_connection()

        cursor = connection.cursor()
        cursor.execute("""
            SELECT EXISTS (
                SELECT *
                FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = 'email'
            );
        """)
        result = cursor.fetchone()
        assert result == (True,)

    finally:
        if connection:
            cursor.close()
            connection.close()
