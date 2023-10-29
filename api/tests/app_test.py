import pytest
import psycopg2

# Check if the database is connected.
def test_postgres_connection():
    try:
        connection = psycopg2.connect(
            user="zsitdxsagpsldt",
            password="16d14b5c5bdabc1b38c5b5d435757f84f7afcf0bf1f5d93db76f34b069e6a77c",
            host="ec2-34-193-110-25.compute-1.amazonaws.com",
            port="5432",
            database="df4cpci37ne0rp"
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

# Check if 'users' table exists within the database.
def test_users_table_existence():
    try:
        connection = psycopg2.connect(
            dbname='df4cpci37ne0rp',
            user='zsitdxsagpsldt',
            password='16d14b5c5bdabc1b38c5b5d435757f84f7afcf0bf1f5d93db76f34b069e6a77c',
            host='ec2-34-193-110-25.compute-1.amazonaws.com',
            port='5432'
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

# Check if 'email' column exists within the 'users' table.
def test_column_existence():
    try:
        connection = psycopg2.connect(
            dbname='df4cpci37ne0rp',
            user='zsitdxsagpsldt',
            password='16d14b5c5bdabc1b38c5b5d435757f84f7afcf0bf1f5d93db76f34b069e6a77c',
            host='ec2-34-193-110-25.compute-1.amazonaws.com',
            port='5432'
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

