document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    
    load_mailbox('inbox');
    inbox_mailbox();

  });
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#sent').addEventListener('click', () => {
    load_mailbox('sent');
    sent_mailbox(); 
  });

  document.querySelector('#archived').addEventListener('click', () => {
    load_mailbox('archived');
    archive_mailbox();
  
});

  load_mailbox('inbox')
  inbox_mailbox();

  function compose_email() {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#mailbox_content').style.display = 'none';
    document.querySelector('#mail_content').style.display = 'none';

    const emailsContent = document.getElementById('compose-view');
    const userEmail = document.querySelector('h2').innerHTML;

    emailsContent.innerHTML = `
    <div id="compose-view">
    <h3>New Email</h3>
    <form id="compose-form">
      <div class="form-group">
      From: <input disabled class="form-control" value="${userEmail}">
      </div>
      <div class="form-group">
      To: <input id="compose-recipients" class="form-control" name="recipients" autocomplete="off">
      </div>
      <div class="form-group">
      <input class="form-control" id="compose-subject" placeholder="Subject">
      </div>
      <br><textarea class="form-control" id="compose-body" placeholder="Body" rows="10"></textarea>
      <input type="submit" id="compose_submit" class="btn btn-primary" value="submit"/>
    </form>
    </div>
`;

    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    document.querySelector('#compose_submit').addEventListener('click', function(event) {
      event.preventDefault(); 
      send_email(); 
    });
  }

  function load_mailbox(mailbox) {
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#mail_content').style.display = 'none';
    document.querySelector('#mailbox_content').style.display = 'none';
  
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    
  }

  function sendReplyEmail(recipients, subject, body) {
    return fetch('/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipients,
        subject,
        body
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data; 
    })
    .catch(error => {
      console.error('error sending message', error);
      throw error;
    });
    
  }
  
  function send_email() {
    const recipients = document.getElementById("compose-recipients").value;
    const subject = document.getElementById("compose-subject").value;
    const body = document.getElementById("compose-body").value;
  
    sendReplyEmail(recipients, subject, body)
      .then(() => document.querySelector('#sent').click())
      .catch(error => {
        console.error('error sending message', error)
      });
  }


function renderEmails(emails, mailboxType) {
  const emailsContent = document.getElementById('mailbox_content');
  emailsContent.dataset.mailboxType = mailboxType;
  emailsContent.innerHTML = '';

  emails.forEach(email => {
      const emailDiv = document.createElement('div');
      emailDiv.classList.add('list-group-item', 'list-group-item-action');
      emailDiv.dataset.id = email.id;
      emailDiv.dataset.archived = email.archived
      emailDiv.dataset.read = email.read

      const mailboxContent = document.getElementById("mailbox_content");

      const readColor = (email.read && mailboxType === 'inbox') 
        ? "rgba(128, 128, 128, 0.15)"
        : ""; 
      emailDiv.style.backgroundColor = readColor;


      const inboxHTML = mailboxType === 'inbox' ?
      `
      <span class="badge text-bg-warning">${email.read ? 'Read' : 'Unread'}</span>
      ` :
      '';
      emailDiv.innerHTML = `
          <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">${email.subject}</h5>
              <small>${email.timestamp}<br>
              ${inboxHTML}
              </small>
          </div>
          <p class="mb-1">${email.body}</p>
          <small>From: ${email.sender} To: ${email.recipients}</small>
      `;
      emailDiv.addEventListener('click', function() {
        const emailId = this.dataset.id;
        readEmail(emailId);
        mailContent(emailId, mailboxType) ; 
      });
      emailsContent.appendChild(emailDiv);
  });

  function readEmail(emailId) {
    fetch(`/emails/${emailId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(email => {
      const emailRead = email.read;
      if (!emailRead) {
        return fetch(`/emails/${emailId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            read: true
          })
        })
      }
    })
  }
}

function inbox_mailbox() {
    document.querySelector('#mailbox_content').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#mail_content').style.display = 'none';
    

    fetch('/emails/inbox', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(emails => {
      const mailboxType = 'inbox'; 
      renderEmails(emails, mailboxType);
    })
    .catch(error => {
        console.error('Error fetching inbox emails:', error);
    });
}

function sent_mailbox() {
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#mail_content').style.display = 'none';
    document.querySelector('#mailbox_content').style.display = 'block';

    fetch('/emails/sent', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(emails => renderEmails(emails))
    .catch(error => {
        console.error('Error fetching sent emails:', error);
    });
}

function archive_mailbox() {
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#mail_content').style.display = 'none';
    document.querySelector('#mailbox_content').style.display = 'block';

    fetch('/emails/archive', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(emails => {
      const mailboxType = 'archived'; 
      renderEmails(emails, mailboxType);
    })
    .catch(error => {
        console.error('Error fetching sent emails:', error);
    });


}

function renderEmailContents(email) {

  const emailsContent = document.getElementById('mail_content');
  emailsContent.innerHTML = '';
  
  const emailDiv = document.createElement('dl');
  emailDiv.dataset.id = email.id;
  emailDiv.dataset.archived = email.archived;
  const mailboxContent = document.getElementById('mailbox_content');
  const mailboxType = mailboxContent.dataset.mailboxType;

  const inboxHTML = mailboxType === 'inbox' ?
  `
  <button id="archive-button" type="button" class="btn btn-success">Archive</button>
  <button id="reply-button" type="button" class="btn btn-primary">Reply</button>
  ` :
  '';
  const archiveboxHTML = mailboxType === 'archived' ?
  `
  <button id="archive-button" type="button" class="btn btn-success">UnArchive</button>
  ` :
  '';

  emailDiv.innerHTML = `
    <dl id="mail_content" class="row">
      <dt class="col-sm-3">Subject</dt>
      <dd class="col-sm-9">${email.subject}</dd>

      <dt class="col-sm-3">${email.timestamp}</dt>
      <dd class="col-sm-9">
          <p>From:&nbsp${email.sender} &nbsp&nbsp&nbspTo:&nbsp${email.recipients}</p>
          <p>${email.body}</p>
      </dd>
    </dl>
    ${inboxHTML}
    ${archiveboxHTML}
  `;

    emailsContent.appendChild(emailDiv);
    const archiveButton = document.getElementById('archive-button');
    const replyButton = document.getElementById('reply-button');
    
  if (archiveButton) {
    archiveButton.addEventListener('click', () => {
      archived(email.id)
      document.querySelector('#inbox').click();
    });
  }
  if (replyButton) {
    replyButton.addEventListener('click', () => {
      replyToEmail(email)
  });
  }
}

function mailContent(emailId, mailboxType) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mailbox_content').style.display = 'none';
  document.querySelector('#mail_content').style.display = 'block';

  fetch(`/emails/${emailId}`, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(email => {
    console.log('Returned emails:', email);
    renderEmailContents(email, mailboxType);
  })
  .catch(error => {
    console.error('Error fetching inbox email:', error);
  });
}

function replyToEmail(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mailbox_content').style.display = 'none';
  document.querySelector('#mail_content').style.display = 'none';
  
  const emailsContent = document.getElementById('compose-view');
  const subject = email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`;

  emailsContent.innerHTML = `
    <div id="reply-view">
      <h3>Reply Email</h3>
      <form id="reply-form">
        <div class="form-group">
           From <input class="form-control" value="${email.recipients}">
        </div>
        <div class="form-group">
        To: <input id="reply-recipients" class="form-control" value="${email.sender}">
        </div>
        <div class="form-group">
          Subject: <input class="form-control" id="reply-subject" value="${subject}">
        </div>
        <br><textarea class="form-control" id="reply-body" placeholder="Body" rows="10">
          \n\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}
        </textarea>
        <input type="submit" id="reply_submit" class="btn btn-primary" value="Submit"/>
      </form>
    </div>
  `;
  
  const submitButton = document.querySelector('#reply_submit');
  submitButton.addEventListener('click', function(event) {
    event.preventDefault(); 

    const recipients = email.sender;
    const subject = document.querySelector('#reply-subject').value;
    const body = document.querySelector('#reply-body').value;

    sendReplyEmail(recipients, subject, body)
      .then(data => {
        console.log('Email sent successfully:', data);
        inbox_mailbox();
      })
      .catch(error => {
        console.error('Error sending email:', error);
      });
  });
}

function archived(emailId) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mailbox_content').style.display = 'none';
  document.querySelector('#mail_content').style.display = 'block';

  fetch(`/emails/${emailId}`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(email => {
    const newArchivedState = !email.archived;

    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        archived: newArchivedState
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      inbox_mailbox();
    })
    .catch(error => {
      console.error('Error archiving email:', error);
    });
  })
  .catch(error => {
    console.error('Error fetching email:', error);
  });
}


});
