import pytest
import psycopg2
import os


# Checks if the database is connected.
# This test case was made by Steven Zhang.
def test_postgres_connection():
    try:
        connection = psycopg2.connect(
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
            host=os.environ.get("DB_HOST"),
            port=os.environ.get("DB_PORT"),
            database=os.environ.get("DB_NAME")
        )

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
# This test case was made by Steven Zhang.

def test_users_table_existence():
    try:
        connection = psycopg2.connect(
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
            host=os.environ.get("DB_HOST"),
            port=os.environ.get("DB_PORT"),
            database=os.environ.get("DB_NAME")
        )

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
        cursor.close()
        connection.close()

# Checks if 'email' column exists within the 'users' table.
# This test case was made by Steven Zhang.

def test_column_existence():
    try:
        connection = psycopg2.connect(
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
            host=os.environ.get("DB_HOST"),
            port=os.environ.get("DB_PORT"),
            database=os.environ.get("DB_NAME")
        )

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
        cursor.close()
        connection.close()

