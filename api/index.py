from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
import random
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SECRET_KEY'] = 'supersecretkey'
app.config['SESSION_TYPE'] = 'sqlalchemy'
if os.getenv('FLASK_ENV') == 'production':
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')  # PostgreSQL in production
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///audiobooks.db'  # SQLite for development

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

db = SQLAlchemy(app)
app.config['SESSION_SQLALCHEMY'] = db
Session(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

class Audiobook(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200), nullable=False)
    cover_image = db.Column(db.String(300), nullable=False)
    votes = db.Column(db.Integer, default=0)
    total_votes = db.Column(db.Integer, default=0)


class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    audiobook_id = db.Column(db.Integer, db.ForeignKey('audiobook.id'), nullable=False)
    value = db.Column(db.Integer, nullable=False)


with app.app_context():
    db.create_all()

    if Audiobook.query.count() == 0:
        audiobooks = [
            {"title": "The Hobbit", "author": "J.R.R. Tolkien", "cover_image": "https://example.com/hobbit.jpg"},
            {"title": "1984", "author": "George Orwell", "cover_image": "https://example.com/1984.jpg"},
            {"title": "To Kill a Mockingbird", "author": "Harper Lee", "cover_image": "https://example.com/mockingbird.jpg"},
            {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "cover_image": "https://example.com/catcher.jpg"},
            {"title": "Moby Dick", "author": "Herman Melville", "cover_image": "https://example.com/mobydick.jpg"},
        ]
        for book in audiobooks:
            audiobook = Audiobook(title=book['title'], author=book['author'], cover_image=book['cover_image'])
            db.session.add(audiobook)
        db.session.commit()

    if User.query.count() == 0:
        users = [
            {"username": "alice", "password": generate_password_hash("password1")},
            {"username": "bob", "password": generate_password_hash("password2")},
            {"username": "charlie", "password": generate_password_hash("password3")}
        ]
        for user in users:
            new_user = User(username=user['username'], password=user['password'])
            db.session.add(new_user)
        db.session.commit()

        users = User.query.all()
        audiobooks = Audiobook.query.all()
        for user in users:
            for _ in range(2):
                audiobook = random.choice(audiobooks)
                if not Vote.query.filter_by(user_id=user.id, audiobook_id=audiobook.id).first():
                    audiobook.votes += 1
                    db.session.add(Vote(user_id=user.id, audiobook_id=audiobook.id))
        db.session.commit()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id
        return jsonify({"msg": "Logged in successfully"}), 200
    return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"msg": "Logged out successfully"}), 200

@app.route('/api/user', methods=['GET'])
def get_user():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return jsonify({"username": user.username}), 200
    else:
        return jsonify({"msg": "Not logged in"}), 401


@app.route('/api/audiobooks', methods=['GET'])
def get_audiobooks():
    audiobooks = Audiobook.query.all()
    user_vote_data = {}

    if 'user_id' in session:
        user_id = session['user_id']
        user_votes = Vote.query.filter_by(user_id=user_id).all()
        user_vote_data = {vote.audiobook_id: vote.value for vote in user_votes}

    data = [
        {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "cover_image": book.cover_image,
            "votes": book.votes,
            "total_votes": book.total_votes,
            "user_vote": user_vote_data.get(book.id, 0)
        }
        for book in audiobooks
    ]
    return jsonify(data), 200




@app.route('/api/vote', methods=['POST'])
def vote():
    if 'user_id' not in session:
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.json
    audiobook_id = data.get('audiobook_id')
    value = data.get('value')
    user_id = session['user_id']

    audiobook = Audiobook.query.get(audiobook_id)
    if not audiobook:
        return jsonify({"msg": "Audiobook not found"}), 404

    existing_vote = Vote.query.filter_by(user_id=user_id, audiobook_id=audiobook_id).first()

    if existing_vote:
        if value == 0:
            audiobook.votes -= existing_vote.value
            db.session.delete(existing_vote)
        else:
            audiobook.votes -= existing_vote.value
            existing_vote.value = value
            audiobook.votes += value
    else:
        if value != 0:
            new_vote = Vote(user_id=user_id, audiobook_id=audiobook_id, value=value)
            db.session.add(new_vote)
            audiobook.votes += value

    audiobook.total_votes = Vote.query.filter_by(audiobook_id=audiobook_id).count()
    db.session.commit()

    return jsonify({"msg": "Vote recorded", "votes": audiobook.votes}), 200




if __name__ == '__main__':
    app.run(debug=True)
