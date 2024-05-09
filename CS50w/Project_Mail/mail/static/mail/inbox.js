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
  
  document.querySelector('#compose_submit').addEventListener('click', function(event) {
    event.preventDefault(); 
    send_email(); 
  });

  inbox_mailbox();

  function compose_email() {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#mailbox_content').style.display = 'none';
    document.querySelector('#mail_content').style.display = 'none';
    
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

  function load_mailbox(mailbox) {
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#mail_content').style.display = 'block';
    document.querySelector('#mailbox_content').style.display = 'block';
    
  
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    
  }


  function send_email() {
    const recipients = document.getElementById("compose-recipients").value;
    const subject = document.getElementById("compose-subject").value;
    const body = document.getElementById("compose-body").value;
  
    fetch('/emails', {
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
    .then(data => console.log(data))
    .catch(error => console.error('error sending message', error));
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
      

      emailDiv.innerHTML = `
          <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">${email.subject}</h5>
              <small>${email.timestamp}</small>
          </div>
          <p class="mb-1">${email.body}</p>
          <small>From: ${email.sender} To: ${email.recipients}</small>
      `;
      emailDiv.addEventListener('click', function() {
        const emailId = this.dataset.id;
        mailContent(emailId) ; 
      });
      emailsContent.appendChild(emailDiv);
      
  });
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
  <button type="button" class="btn btn-success">Archive</button>
  <button class="btn btn-primary">Reply</button>
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
}

function mailContent(emailId, mailbox) {
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
    renderEmailContents(email, mailbox);;
  })
  .catch(error => {
    console.error('Error fetching inbox email:', error);
  });

}
// function archived(emailId) {
//   document.querySelector('#emails-view').style.display = 'none';
//   document.querySelector('#compose-view').style.display = 'none';
//   document.querySelector('#mailbox_content').style.display = 'none';
//   document.querySelector('#mail_content').style.display = 'block';

//   fetch(`/emails/${emailId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       archived: true
//     })
//   })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//   })
//   .catch(error => {
//     console.error('Error archiving email:', error);
//   });
// }

});
