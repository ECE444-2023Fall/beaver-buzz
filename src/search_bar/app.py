from flask import Flask, request, jsonify
from fuzzywuzzy import fuzz

app = Flask(__name__)

# Sample list of events
events = [
    {"name": "420"},
    {"name": "34+35"},
    {"name": "halloween"},
    {"name": "yeehaw"},
]

def fuzzy_search(query, events, threshold=80):
    results = []
    for event in events:
        similarity = fuzz.ratio(query, event["name"])
        if similarity >= threshold:
            results.append(event)
    return results

@app.route('/')
def index():
    return open('index.html').read()

@app.route('/search')
def search():
    query = request.args.get('query', '')
    results = fuzzy_search(query, events)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
