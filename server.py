from flask import Flask, abort, jsonify, render_template, request, session
from jinja2 import TemplateNotFound
import os


app = Flask(__name__)
app.secret_key = 'huehuehuehuehuehuehue' # very secure
if 'HEROKU' in os.environ: # Production mode hack
    pass
else:
    app.debug = True


@app.route('/')
def index():
    return render_template('index.html', debug=app.debug)

@app.route('/login', methods=['POST'])
def login():
    session['username'] = request.form['username']
    return jsonify(success=True)


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify(success=True)


@app.route('/commands/<template>')
def get_command_template(template):
    try:
        return render_template('commands/%s.html' % template)
    except TemplateNotFound:
        abort(404)

@app.route('/man/<template>')
def get_man_template(template):
    try:
        return render_template('man/%s.html' % template)
    except TemplateNotFound:
        abort(404)


if __name__ == "__main__":
    app.run(host='0.0.0.0')
