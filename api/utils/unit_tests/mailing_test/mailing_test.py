import os.path
import sys
import smtplib, ssl
from email_validator import validate_email, EmailNotValidError
import pandas as pd
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import imaplib

pwd = os.path.dirname(__file__)
emails_path = os.path.join(pwd,'../../emails')
sys.path.append(emails_path)

from mailing import Mailer, Inbox


smtp_local = 'localhost'
local_port = 1025 # tls

goog_smtp = 'smtp.gmail.com'
goog_ports_smtp = [465, 587] # [ssl, tls]
goog_imap = 'imap.gmail.com'
goog_ports_imap = [993]


def get_login(f_path, account):
    if not os.path.isfile(f_path):
        logging.error('File does not exist')
    else:
        with open(f_path) as f:
            lines = f.read().splitlines()

        for l in lines:
            l = l.split(' ')
            if l[0] == account:
                return tuple(l[1:])


def format_email(sender, recipient, subject, html):
    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = recipient
    msg['Subject'] = subject
    msg.attach(MIMEText(html, 'html'))
    return msg


def test_reg_email(mailer, mailing_list):
    subject = 'Registration Confirmation'

    for i,entry in mailing_list.iterrows():
        html = open(os.path.join(emails_path,'registration.html')).read().format(
            subject=subject,firstname=entry['firstname'],lastname=entry['lastname'],
            email=entry['email'],phonenumber=entry['phonenumber'],interests=entry['interests'],
            potatoemail=mailer.sender)
        msg = format_email(mailer.sender, entry['email'], subject, html)
        mailer.send_mail(entry['email'],msg.as_string())

if '__main__' == __name__:
    login = get_login(os.path.join(emails_path, 'credentials.txt'), 'app_login')

    mailer = Mailer(goog_smtp, goog_ports_smtp[0], login)
    inbox = Inbox(goog_imap, goog_ports_imap[0], login)

    mailing_list = pd.read_csv(f'{pwd}/mailing_test_data.csv')

    test_reg_email(mailer, mailing_list)

    mail = inbox.read_dir('Inbox')
    print('Inbox Mail:')
    for m in mail:
        print(f'Subject:{m["subject"]}')
        print(f'From:{m["from"]}')
        print(f'To:{m["to"]}')
        print(f'Date:{m["date"]}\n')

    inbox.kill()
    mailer.kill()
    
    