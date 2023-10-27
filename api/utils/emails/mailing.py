import os.path
import smtplib, imaplib, ssl
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email_validator import validate_email, EmailNotValidError
import pandas as pd
import logging
from typing import Iterable
from tqdm import tqdm

logging.basicConfig(filename='mail.log', encoding='utf-8', level=logging.DEBUG)

class Mailer:
    def __init__(self, smtp: str, port: int, login: tuple[str, str]) -> None:
        self.context = ssl.create_default_context()
        self.server = smtplib.SMTP_SSL(smtp, port, context=self.context)
        self.sender = login[0]
        self.server.login(self.sender, login[1])

    def __repr__(self) -> str:
        return str(self.server.helo())

    def send_mail(self, recipient: str, content: str, validate: bool=True) -> None:
        if validate:
            try:
                validate_email(recipient) # This may be redundant, but in the event emails need to be sent to people outside our db
                self.server.sendmail(self.sender, recipient, content)
            except EmailNotValidError as e:
                logging.error(str(e))
        else:
            logging.warn('Sending email with no validation...')
            self.server.sendmail(self.sender, recipient, content)

    def mass_mail(self, recipients: Iterable[str], content: str, validate: bool=True) -> None:
        for r in tqdm(recipients):
            send_mail(r, content, validate)

    def kill(self) -> None:
        return logging.info(self.server.quit())


class Inbox:
    def __init__(self, imap: str, port: int, login: tuple[str,str]) -> None:
        self.server = imaplib.IMAP4_SSL(imap, port)
        self.addr = login[0]
        self.server.login(self.addr, login[1])

    def read_dir(self, _dir: str, search_cond: str='ALL') -> email.message.Message | None:
        ret = []
        self.server.select(_dir)
        status, email_ids = self.server.search(None, search_cond)

        if status == 'OK':
            em_id_list = email_ids[0].split()
            for em_id in tqdm(em_id_list, desc='Fetching Emails...'):
                status, email_data = self.server.fetch(em_id, '(RFC822)')
                if status == 'OK':
                    ret.append(email.message_from_bytes(email_data[0][1]))
            self.server.close()
            return ret
        self.server.close()
        return None

    def delete_email(self, _dir: str, search_cond: str) -> None:
        self.server.select(_dir)
        results, email_ids = self.server.search(None, search_cond)
        for em_id in tqdm(email_ids[0].split(), desc='Flagging Emails for Deletion...'):
            self.server.store(em_id, '+FLAGS', '(\Deleted)')
        self.server.expunge()
        self.server.close()

    def kill(self) -> None:
        self.server.shutdown()


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


def print_dir(mail_data: email.message.Message) -> None:
    print('Inbox Mail:')
    for m in mail_data:
        print(f'Subject:{m["subject"]}')
        print(f'From:{m["from"]}')
        print(f'To:{m["to"]}')
        print(f'Date:{m["date"]}\n')