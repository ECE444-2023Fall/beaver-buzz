import time
from flask import Flask

app = Flask(__name__)

@app.route('/')
def main():
    return "Hello World"

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def page_not_found(e):
    return render_template('500.html'), 500