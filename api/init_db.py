from api import app, db


def reset_db():
    with app.app_context():
        # Drop all tables and sequences
        db.drop_all()
        # Create all tables
        db.create_all()


if __name__ == "__main__":
    reset_db()
