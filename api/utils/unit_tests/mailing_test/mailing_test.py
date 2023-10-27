import os.path
import sys
import smtplib, ssl
from email_validator import validate_email, EmailNotValidError
import pandas as pd
import logging
import imaplib

pwd = os.path.dirname(__file__)
emails_path = os.path.join(pwd,'../../emails')
sys.path.append(emails_path)

from mailing import Mailer, Inbox, get_login, format_email, print_dir


smtp_local = 'localhost'
local_port = 1025 # tls

goog_smtp = 'smtp.gmail.com'
goog_ports_smtp = [465, 587] # [ssl, tls]
goog_imap = 'imap.gmail.com'
goog_ports_imap = [993]


def test_reg_email(mailer, recipient):
    subject = 'Registration Confirmation'
    html = open(os.path.join(emails_path,'registration.html')).read().format(
        subject=subject,firstname=recipient['firstname'],lastname=recipient['lastname'],
        email=recipient['email'],phonenumber=recipient['phonenumber'],interests=recipient['interests'],
        potatoemail=mailer.sender)
    msg = format_email(mailer.sender, recipient['email'], subject, html)
    mailer.send_mail(recipient['email'],msg.as_string())

    mail = inbox.read_dir('Inbox')
    assert any([m["subject"] == subject for m in mail])
    print('Test Registration Email Detected in Inbox')

    print_dir(inbox.read_dir('Inbox', f'(SUBJECT "{subject}")'))

    inbox.delete_email('Inbox', f'(SUBJECT "{subject}")')
    assert ~any([m["subject"] == subject for m in mail])
    print('Test Emails Cleared from Inbox\nTest Passed\n')


def test_sender_login(server, port, login):
    mailer = Mailer(server, port, login)
    verif = mailer.server.verify(server)
    assert verif[0] in [250,251,252]
    print('Successful Sender Connection Established\nTest Passed\n')
    return mailer

def test_inbox_login(server, port, login):
    inbox = Inbox(server, port, login)
    print('Successful Inbox Connection Established')
    inbox.server.select('Inbox')
    assert inbox.server.check()
    print('Inbox Selection Successful')
    inbox.server.close()
    print('Inbox Cloesd\nTest Passed\n')
    return inbox

    

if '__main__' == __name__:
    login = get_login(os.path.join(emails_path, 'credentials.txt'), 'app_login')

    mailer = test_sender_login(goog_smtp, goog_ports_smtp[0], login)
    inbox = test_inbox_login(goog_imap, goog_ports_imap[0], login)

    mailing_list = pd.read_csv(f'{pwd}/mailing_test_data.csv')
    recipient = mailing_list.iloc[0]

    test_reg_email(mailer, recipient)

    inbox.kill()
    mailer.kill()
    
    