import os.path
import smtplib, imaplib, ssl
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email_validator import validate_email, EmailNotValidError
import pandas as pd
from typing import Iterable
from tqdm import tqdm

class Mailer:
    """
    Mailer class handles sending emails to recipients via google's smtp server. Login credentials required for SSL authentication.
    """

    def __init__(self, smtp: str, port: int, login: tuple[str, str]) -> None:
        self.context = ssl.create_default_context()
        self.server = smtplib.SMTP_SSL(smtp, port, context=self.context)
        self.sender = login[0]
        self.server.login(self.sender, login[1])

    def __repr__(self) -> str:
        return str(self.server.helo())

    def send_mail(self, recipient: str, content: str, validate: bool = True) -> None:
        """
        Sends email from account linked to login credentials using google smtp servers.
        Contents can be specified per email using email.message.Message() in string form.
        See format_email function listed below for email structure and inserting html templates.
        Validation flag checks if email address of recipient exists and is valid.
        """
        if validate:
            try:
                validate_email(
                    recipient
                )  # This may be redundant, but in the event emails need to be sent to people outside our db
                self.server.sendmail(self.sender, recipient, content)
            except EmailNotValidError as e:
                print(str(e))
        else:
            print('Sending email with no validation...')
            self.server.sendmail(self.sender, recipient, content)

    def mass_mail(
        self, recipients: Iterable[str], content: str, validate: bool = True
    ) -> None:
        """
        Runs send_mail method over an interable of recipients.
        Useful for mass emailing general announcements.
        """
        for r in tqdm(recipients):
            send_mail(r, content, validate)

    def kill(self) -> None:
        """
        Terminates connection to smtp server.
        """
        return self.server.quit()


class Inbox:
    """
    Inbox class links to Gmail account mailboxes to read and delete emails.
    """

    def __init__(self, imap: str, port: int, login: tuple[str, str]) -> None:
        self.server = imaplib.IMAP4_SSL(imap, port)
        self.addr = login[0]
        self.server.login(self.addr, login[1])

    def read_dir(
        self, _dir: str, search_cond: str = "ALL"
    ) -> email.message.Message | None:
        """
        Reads a mailbox directory and returns email data.
        Can take in a search parameter in the form of string '(<LABEL> "<name>")' to perform
        boolean filter on selected mailbox contents.
        If no search parameter is specified, all mail in mailbox will be returned.
        If mailbox status is not 'OK', methods returns None.
        """
        ret = []
        self.server.select(_dir)
        status, email_ids = self.server.search(None, search_cond)

        if status == "OK":
            em_id_list = email_ids[0].split()
            for em_id in tqdm(em_id_list, desc="Fetching Emails..."):
                status, email_data = self.server.fetch(em_id, "(RFC822)")
                if status == "OK":
                    ret.append(email.message_from_bytes(email_data[0][1]))
            self.server.close()
            return ret
        self.server.close()
        return None

    def delete_email(self, _dir: str, search_cond: str) -> None:
        """
        Deletes email in specified directory with respect to search_cond.
        search_cond is a string in the form of '(<LABEL> "<name>")'.
        """
        self.server.select(_dir)
        results, email_ids = self.server.search(None, search_cond)
        for em_id in tqdm(email_ids[0].split(), desc="Flagging Emails for Deletion..."):
            self.server.store(em_id, "+FLAGS", "(\Deleted)")
        self.server.expunge()
        self.server.close()

    def kill(self) -> None:
        self.server.shutdown()


def get_login(f_path, account):
    """
    Reads login credentials from a textfile.
    """
    if not os.path.isfile(f_path):
        print('File does not exist')
    else:
        with open(f_path) as f:
            lines = f.read().splitlines()

        for l in lines:
            l = l.split(" ")
            if l[0] == account:
                return tuple(l[1:])


def format_email(sender, recipient, subject, html):
    """
    Default email format.
    """
    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))
    return msg


def print_dir(mail_data: email.message.Message) -> None:
    """
    Prints the subject, recipient, sender, and date of mail_data provided.
    """
    print("Inbox Mail:")
    for m in mail_data:
        print(f'Subject:{m["subject"]}')
        print(f'From:{m["from"]}')
        print(f'To:{m["to"]}')
        print(f'Date:{m["date"]}\n')
