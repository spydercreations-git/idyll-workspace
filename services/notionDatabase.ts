import { Client } from '@notionhq/client';

// Notion configuration - Your Database IDs
const NOTION_TOKEN = import.meta.env.VITE_NOTION_TOKEN || 'secret_ntn_109450174599tAutVmWIY5g3F78LwxWg5LuZC8sROik0SzWe';
const TASKS_DATABASE_ID = import.meta.env.VITE_NOTION_TASKS_DB || '2cc28c5fb67380b6b9eadeea94981afb';
const MEETINGS_DATABASE_ID = import.meta.env.VITE_NOTION_MEETINGS_DB || '2e628c5fb67380e58d64eef87105515d';
const PAYOUTS_DATABASE_ID = import.meta.env.VITE_NOTION_PAYOUTS_DB || '2e628c5fb67380568bd2ef6a1eb05965';
const APPLICATIONS_DATABASE_ID = import.meta.env.VITE_NOTION_APPLICATIONS_DB || '2e628c5fb6738005950fdadb6dcd2ba3';
const NOTIFICATIONS_DATABASE_ID = import.meta.env.VITE_NOTION_NOTIFICATIONS_DB || '2e628c5fb673807fbf92f7fbd55fa913';

const notion = new Client({
  auth: NOTION_TOKEN,
});

// Notion Database Service - Primary Database
export const notionDatabase = {
  // TASKS
  async getTasks() {
    if (!TASKS_DATABASE_ID) return { data: [], error: 'Tasks database not configured' };
    
    try {
      const response = await notion.databases.query({
        database_id: TASKS_DATABASE_ID,
        sorts: [{ property: 'Created', direction: 'descending' }]
      });
      
      const tasks = response.results.map(page => this.parseTaskFromNotion(page));
      return { data: tasks, error: null };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { data: [], error: error.message };
    }
  },

  // Get user-specific data by email
  async getTasksByEmail(email: string) {
    if (!TASKS_DATABASE_ID) return { data: [], error: 'Tasks database not configured' };
    
    try {
      const response = await notion.databases.query({
        database_id: TASKS_DATABASE_ID,
        filter: {
          property: 'Assigned To',
          email: {
            equals: email
          }
        },
        sorts: [{ property: 'Created', direction: 'descending' }]
      });
      
      const tasks = response.results.map(page => this.parseTaskFromNotion(page));
      return { data: tasks, error: null };
    } catch (error) {
      console.error('Error fetching tasks by email:', error);
      return { data: [], error: error.message };
    }
  },

  async getMeetingsByEmail(email: string) {
    if (!MEETINGS_DATABASE_ID) return { data: [], error: 'Meetings database not configured' };
    
    try {
      const response = await notion.databases.query({
        database_id: MEETINGS_DATABASE_ID,
        filter: {
          property: 'Attendees Emails',
          multi_select: {
            contains: email
          }
        },
        sorts: [{ property: 'Date', direction: 'ascending' }]
      });
      
      const meetings = response.results.map(page => this.parseMeetingFromNotion(page));
      return { data: meetings, error: null };
    } catch (error) {
      console.error('Error fetching meetings by email:', error);
      return { data: [], error: error.message };
    }
  },

  async getPayoutsByEmail(email: string) {
    if (!PAYOUTS_DATABASE_ID) return { data: [], error: 'Payouts database not configured' };
    
    try {
      const response = await notion.databases.query({
        database_id: PAYOUTS_DATABASE_ID,
        filter: {
          property: 'Editor Email',
          email: {
            equals: email
          }
        },
        sorts: [{ property: 'Requested Date', direction: 'descending' }]
      });
      
      const payouts = response.results.map(page => this.parsePayoutFromNotion(page));
      return { data: payouts, error: null };
    } catch (error) {
      console.error('Error fetching payouts by email:', error);
      return { data: [], error: error.message };
    }
  },

  async createTask(taskData: any) {
    if (!TASKS_DATABASE_ID) return { data: null, error: 'Tasks database not configured' };
    
    try {
      const properties = {
        'Task Number': {
          number: Date.now() // Use timestamp for unique task numbers
        },
        'Name': {
          rich_text: [{ text: { content: taskData.name || '' } }]
        },
        'Assigned To': {
          email: taskData.assigned_to || null
        },
        'Status': {
          select: { name: this.capitalizeFirst(taskData.status || 'pending') }
        },
        'Priority': {
          select: { name: this.capitalizeFirst(taskData.priority || 'medium') }
        },
        'Deadline': {
          date: taskData.deadline ? { start: taskData.deadline } : null
        },
        'Raw File': {
          url: taskData.raw_file || null
        },
        'Edited File': {
          url: taskData.edited_file || null
        },
        'Idyll Approval': {
          select: { name: 'Reviewing' }
        }
      };

      const response = await notion.pages.create({
        parent: { database_id: TASKS_DATABASE_ID },
        properties
      });

      const task = this.parseTaskFromNotion(response);
      return { data: task, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error: error.message };
    }
  },

  async updateTask(taskId: string, updates: any) {
    if (!TASKS_DATABASE_ID) return { data: null, error: 'Tasks database not configured' };
    
    try {
      const properties: any = {};
      
      if (updates.name) properties['Name'] = { rich_text: [{ text: { content: updates.name } }] };
      if (updates.assigned_to) properties['Assigned To'] = { email: updates.assigned_to };
      if (updates.status) properties['Status'] = { select: { name: this.capitalizeFirst(updates.status) } };
      if (updates.priority) properties['Priority'] = { select: { name: this.capitalizeFirst(updates.priority) } };
      if (updates.deadline) properties['Deadline'] = { date: { start: updates.deadline } };
      if (updates.raw_file) properties['Raw File'] = { url: updates.raw_file };
      if (updates.edited_file) properties['Edited File'] = { url: updates.edited_file };

      const response = await notion.pages.update({
        page_id: taskId,
        properties
      });

      const task = this.parseTaskFromNotion(response);
      return { data: task, error: null };
    } catch (error) {
      console.error('Error updating task:', error);
      return { data: null, error: error.message };
    }
  },

  async deleteTask(taskId: string) {
    if (!TASKS_DATABASE_ID) return { error: 'Tasks database not configured' };
    
    try {
      await notion.pages.update({
        page_id: taskId,
        archived: true
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { error: error.message };
    }
  },

  // MEETINGS
  async getMeetings() {
    if (!MEETINGS_DATABASE_ID) return { data: [], error: 'Meetings database not configured' };
    
    try {
      const response = await notion.databases.query({
        database_id: MEETINGS_DATABASE_ID,
        sorts: [{ property: 'Date', direction: 'ascending' }]
      });
      
      const meetings = response.results.map(page => this.parseMeetingFromNotion(page));
      return { data: meetings, error: null };
    } catch (error) {
      console.error('Error fetching meetings:', error);
      return { data: [], error: error.message };
    }
  },

  async createMeeting(meetingData: any) {
    if (!MEETINGS_DATABASE_ID) return { data: null, error: 'Meetings database not configured' };
    
    try {
      const properties = {
        'Title': {
          title: [{ text: { content: meetingData.title || '' } }]
        },
        'Date': {
          date: meetingData.date ? { start: meetingData.date } : null
        },
        'Time': {
          rich_text: [{ text: { content: meetingData.time || '' } }]
        },
        'Attendees Emails': {
          multi_select: Array.isArray(meetingData.attendees_emails) 
            ? meetingData.attendees_emails.map(email => ({ name: email }))
            : [{ name: meetingData.attendees_emails || '' }]
        },
        'Attendees Names': {
          multi_select: Array.isArray(meetingData.attendees) 
            ? meetingData.attendees.map(name => ({ name }))
            : [{ name: meetingData.attendees || '' }]
        },
        'Organizer': {
          rich_text: [{ text: { content: meetingData.organizer || '' } }]
        },
        'Link': {
          url: meetingData.link || null
        }
      };

      const response = await notion.pages.create({
        parent: { database_id: MEETINGS_DATABASE_ID },
        properties
      });

      const meeting = this.parseMeetingFromNotion(response);
      return { data: meeting, error: null };
    } catch (error) {
      console.error('Error creating meeting:', error);
      return { data: null, error: error.message };
    }
  },

  async deleteMeeting(meetingId: string) {
    if (!MEETINGS_DATABASE_ID) return { error: 'Meetings database not configured' };
    
    try {
      await notion.pages.update({
        page_id: meetingId,
        archived: true
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return { error: error.message };
    }
  },

  // PAYOUTS
  async getPayouts() {
    if (!PAYOUTS_DATABASE_ID) return { data: [], error: 'Payouts database not configured' };
    
    try {
      const response = await notion.databases.query({
        database_id: PAYOUTS_DATABASE_ID,
        sorts: [{ property: 'Requested Date', direction: 'descending' }]
      });
      
      const payouts = response.results.map(page => this.parsePayoutFromNotion(page));
      return { data: payouts, error: null };
    } catch (error) {
      console.error('Error fetching payouts:', error);
      return { data: [], error: error.message };
    }
  },

  async createPayout(payoutData: any) {
    if (!PAYOUTS_DATABASE_ID) return { data: null, error: 'Payouts database not configured' };
    
    try {
      const properties = {
        'Project': {
          title: [{ text: { content: payoutData.project || '' } }]
        },
        'Editor Email': {
          email: payoutData.editor_email || null
        },
        'Editor Name': {
          rich_text: [{ text: { content: payoutData.editor || '' } }]
        },
        'Amount': {
          number: payoutData.amount || 0
        },
        'Status': {
          select: { name: this.capitalizeFirst(payoutData.status || 'pending') }
        },
        'Edited Link': {
          url: payoutData.edited_link || null
        },
        'Payment Method': {
          rich_text: [{ text: { content: payoutData.payment_method || '' } }]
        },
        'Requested Date': {
          date: { start: new Date().toISOString().split('T')[0] }
        }
      };

      const response = await notion.pages.create({
        parent: { database_id: PAYOUTS_DATABASE_ID },
        properties
      });

      const payout = this.parsePayoutFromNotion(response);
      return { data: payout, error: null };
    } catch (error) {
      console.error('Error creating payout:', error);
      return { data: null, error: error.message };
    }
  },

  async updatePayout(payoutId: string, updates: any) {
    if (!PAYOUTS_DATABASE_ID) return { data: null, error: 'Payouts database not configured' };
    
    try {
      const properties: any = {};
      
      if (updates.status) properties['Status'] = { select: { name: this.capitalizeFirst(updates.status) } };

      const response = await notion.pages.update({
        page_id: payoutId,
        properties
      });

      const payout = this.parsePayoutFromNotion(response);
      return { data: payout, error: null };
    } catch (error) {
      console.error('Error updating payout:', error);
      return { data: null, error: error.message };
    }
  },

  async deletePayout(payoutId: string) {
    if (!PAYOUTS_DATABASE_ID) return { error: 'Payouts database not configured' };
    
    try {
      await notion.pages.update({
        page_id: payoutId,
        archived: true
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting payout:', error);
      return { error: error.message };
    }
  },

  // APPLICATIONS
  async getApplications() {
    if (!APPLICATIONS_DATABASE_ID) return { data: [], error: 'Applications database not configured' };
    
    try {
      const response = await notion.databases.query({
        database_id: APPLICATIONS_DATABASE_ID,
        sorts: [{ property: 'Applied Date', direction: 'descending' }]
      });
      
      const applications = response.results.map(page => this.parseApplicationFromNotion(page));
      return { data: applications, error: null };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return { data: [], error: error.message };
    }
  },

  async createApplication(applicationData: any) {
    if (!APPLICATIONS_DATABASE_ID) return { data: null, error: 'Applications database not configured' };
    
    try {
      const properties = {
        'Name': {
          title: [{ text: { content: applicationData.name || '' } }]
        },
        'Email': {
          email: applicationData.email || null
        },
        'Status': {
          select: { name: 'Pending' }
        },
        'Software': {
          rich_text: [{ text: { content: applicationData.software || '' } }]
        },
        'Role': {
          rich_text: [{ text: { content: applicationData.role || 'Editor' } }]
        },
        'Portfolio': {
          url: applicationData.portfolio || null
        },
        'Location': {
          rich_text: [{ text: { content: applicationData.location || '' } }]
        },
        'Contact': {
          rich_text: [{ text: { content: applicationData.contact || '' } }]
        },
        'Applied Date': {
          date: { start: new Date().toISOString().split('T')[0] }
        }
      };

      const response = await notion.pages.create({
        parent: { database_id: APPLICATIONS_DATABASE_ID },
        properties
      });

      const application = this.parseApplicationFromNotion(response);
      return { data: application, error: null };
    } catch (error) {
      console.error('Error creating application:', error);
      return { data: null, error: error.message };
    }
  },

  async updateApplication(applicationId: string, updates: any) {
    if (!APPLICATIONS_DATABASE_ID) return { data: null, error: 'Applications database not configured' };
    
    try {
      const properties: any = {};
      
      if (updates.status) properties['Status'] = { select: { name: this.capitalizeFirst(updates.status) } };

      const response = await notion.pages.update({
        page_id: applicationId,
        properties
      });

      const application = this.parseApplicationFromNotion(response);
      return { data: application, error: null };
    } catch (error) {
      console.error('Error updating application:', error);
      return { data: null, error: error.message };
    }
  },

  async deleteApplication(applicationId: string) {
    if (!APPLICATIONS_DATABASE_ID) return { error: 'Applications database not configured' };
    
    try {
      await notion.pages.update({
        page_id: applicationId,
        archived: true
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting application:', error);
      return { error: error.message };
    }
  },

  // NOTIFICATIONS
  async getNotifications() {
    if (!NOTIFICATIONS_DATABASE_ID) return { data: [], error: 'Notifications database not configured' };
    
    try {
      const response = await notion.databases.query({
        database_id: NOTIFICATIONS_DATABASE_ID,
        sorts: [{ property: 'Created', direction: 'descending' }]
      });
      
      const notifications = response.results.map(page => this.parseNotificationFromNotion(page));
      return { data: notifications, error: null };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: [], error: error.message };
    }
  },

  async createNotification(notificationData: any) {
    if (!NOTIFICATIONS_DATABASE_ID) return { data: null, error: 'Notifications database not configured' };
    
    try {
      const properties = {
        'Title': {
          title: [{ text: { content: notificationData.title || '' } }]
        },
        'Message': {
          rich_text: [{ text: { content: notificationData.message || '' } }]
        },
        'Type': {
          select: { name: notificationData.type || 'info' }
        },
        'Urgent': {
          checkbox: notificationData.urgent || false
        },
        'Time': {
          rich_text: [{ text: { content: notificationData.time || 'Just now' } }]
        }
      };

      const response = await notion.pages.create({
        parent: { database_id: NOTIFICATIONS_DATABASE_ID },
        properties
      });

      const notification = this.parseNotificationFromNotion(response);
      return { data: notification, error: null };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { data: null, error: error.message };
    }
  },

  // POLLING FOR REAL-TIME UPDATES
  startPolling(callback: (type: string, data: any) => void) {
    console.log('🔄 Starting Notion polling for real-time updates...');
    
    // Store last check time
    let lastCheckTime = Date.now();
    
    setInterval(async () => {
      try {
        await this.pollForChanges(callback, lastCheckTime);
        lastCheckTime = Date.now();
      } catch (error) {
        console.error('❌ Error polling Notion:', error);
      }
    }, 3000); // Poll every 3 seconds for better reliability
  },

  async pollForChanges(callback: (type: string, data: any) => void, lastCheckTime: number) {
    // Poll each database for recent changes
    const databases = [
      { id: TASKS_DATABASE_ID, type: 'tasks', parser: this.parseTaskFromNotion },
      { id: MEETINGS_DATABASE_ID, type: 'meetings', parser: this.parseMeetingFromNotion },
      { id: PAYOUTS_DATABASE_ID, type: 'payouts', parser: this.parsePayoutFromNotion },
      { id: APPLICATIONS_DATABASE_ID, type: 'applications', parser: this.parseApplicationFromNotion },
      { id: NOTIFICATIONS_DATABASE_ID, type: 'notifications', parser: this.parseNotificationFromNotion }
    ];

    for (const db of databases) {
      if (!db.id) continue;
      
      try {
        // Get all recent items (last 10 items) and check timestamps
        const response = await notion.databases.query({
          database_id: db.id,
          sorts: [{ property: 'Created time', direction: 'descending' }],
          page_size: 10
        });

        let hasChanges = false;
        for (const page of response.results) {
          // Check both created and last edited time
          const createdTime = new Date(page.created_time).getTime();
          const editedTime = new Date(page.last_edited_time).getTime();
          
          if (createdTime > lastCheckTime || editedTime > lastCheckTime) {
            console.log(`🔄 Detected ${db.type} change in Notion (created: ${new Date(createdTime)}, edited: ${new Date(editedTime)})`);
            hasChanges = true;
            break;
          }
        }

        // If changes detected, trigger callback to refresh all data
        if (hasChanges) {
          console.log(`📡 Triggering refresh for ${db.type}`);
          callback(db.type, { refresh: true });
        }
      } catch (error) {
        console.error(`Error polling ${db.type}:`, error);
      }
    }
  },

  // PARSERS
  parseTaskFromNotion(page: any) {
    const props = page.properties;
    const taskNumber = this.getPropertyValue(props['Task Number'], 'number');
    return {
      id: page.id,
      task_number: taskNumber ? `T${String(taskNumber).slice(-3).padStart(3, '0')}` : `T${Date.now().toString().slice(-3)}`,
      name: this.getPropertyValue(props['Name'], 'rich_text'),
      assigned_to: this.getPropertyValue(props['Assigned To'], 'email'),
      status: this.getPropertyValue(props['Status'], 'select')?.toLowerCase() || 'pending',
      priority: this.getPropertyValue(props['Priority'], 'select')?.toLowerCase() || 'medium',
      deadline: this.getPropertyValue(props['Deadline'], 'date'),
      raw_file: this.getPropertyValue(props['Raw File'], 'url'),
      edited_file: this.getPropertyValue(props['Edited File'], 'url'),
      approval_status: this.getPropertyValue(props['Idyll Approval'], 'select')?.toLowerCase() || 'reviewing',
      created_at: page.created_time,
      updated_at: page.last_edited_time
    };
  },

  parseMeetingFromNotion(page: any) {
    const props = page.properties;
    return {
      id: page.id,
      title: this.getPropertyValue(props['Title'], 'title'),
      date: this.getPropertyValue(props['Date'], 'date'),
      time: this.getPropertyValue(props['Time'], 'rich_text'),
      attendees: props['Attendees Names']?.multi_select?.map((item: any) => item.name) || [],
      attendees_emails: props['Attendees Emails']?.multi_select?.map((item: any) => item.name) || [],
      organizer: this.getPropertyValue(props['Organizer'], 'rich_text'),
      link: this.getPropertyValue(props['Link'], 'url'),
      created_at: page.created_time
    };
  },

  parsePayoutFromNotion(page: any) {
    const props = page.properties;
    return {
      id: page.id,
      editor: this.getPropertyValue(props['Editor Name'], 'rich_text'),
      editor_email: this.getPropertyValue(props['Editor Email'], 'email'),
      project: this.getPropertyValue(props['Project'], 'rich_text'),
      amount: this.getPropertyValue(props['Amount'], 'number') || 0,
      status: this.getPropertyValue(props['Status'], 'select')?.toLowerCase() || 'pending',
      edited_link: this.getPropertyValue(props['Edited Link'], 'url'),
      payment_method: this.getPropertyValue(props['Payment Method'], 'rich_text'),
      requested_at: this.getPropertyValue(props['Requested Date'], 'date'),
      updated_at: page.last_edited_time
    };
  },

  parseApplicationFromNotion(page: any) {
    const props = page.properties;
    return {
      id: page.id,
      name: this.getPropertyValue(props['Name'], 'title'),
      email: this.getPropertyValue(props['Email'], 'email'),
      status: this.getPropertyValue(props['Status'], 'select')?.toLowerCase() || 'pending',
      software: this.getPropertyValue(props['Software'], 'rich_text'),
      role: this.getPropertyValue(props['Role'], 'rich_text'),
      portfolio: this.getPropertyValue(props['Portfolio'], 'url'),
      location: this.getPropertyValue(props['Location'], 'rich_text'),
      contact: this.getPropertyValue(props['Contact'], 'rich_text'),
      applied_at: this.getPropertyValue(props['Applied Date'], 'date')
    };
  },

  parseMessageFromNotion(page: any) {
    const props = page.properties;
    return {
      id: page.id,
      sender: this.getPropertyValue(props['Sender'], 'title'),
      message: this.getPropertyValue(props['Message'], 'rich_text'),
      type: this.getPropertyValue(props['Type'], 'select') || 'user',
      timestamp: this.getPropertyValue(props['Timestamp'], 'date') || page.created_time
    };
  },

  parseNotificationFromNotion(page: any) {
    const props = page.properties;
    return {
      id: page.id,
      title: this.getPropertyValue(props['Title'], 'title'),
      message: this.getPropertyValue(props['Message'], 'rich_text'),
      type: this.getPropertyValue(props['Type'], 'select') || 'info',
      urgent: this.getPropertyValue(props['Urgent'], 'checkbox') || false,
      time: this.getPropertyValue(props['Time'], 'rich_text') || 'Just now',
      created_at: page.created_time,
      read_at: null
    };
  },

  // HELPERS
  getPropertyValue(property: any, type: string) {
    if (!property) return null;
    
    switch (type) {
      case 'title':
        return property.title?.[0]?.text?.content || '';
      case 'rich_text':
        return property.rich_text?.[0]?.text?.content || '';
      case 'select':
        return property.select?.name || null;
      case 'email':
        return property.email || null;
      case 'url':
        return property.url || null;
      case 'date':
        return property.date?.start || null;
      case 'number':
        return property.number || null;
      case 'checkbox':
        return property.checkbox || false;
      default:
        return null;
    }
  },

  capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};