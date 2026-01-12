import { Client } from '@notionhq/client';
import { supabase } from '../lib/supabase';
import { tasksService, usersService, applicationsService, meetingsService, payoutsService } from './database';

// Notion configuration
const NOTION_TOKEN = import.meta.env.VITE_NOTION_TOKEN || 'secret_ntn_109450174599tAutVmWIY5g3F78LwxWg5LuZC8sROik0SzWe';
const TASKS_DATABASE_ID = import.meta.env.VITE_NOTION_TASKS_DB || '';
const USERS_DATABASE_ID = import.meta.env.VITE_NOTION_USERS_DB || '';
const APPLICATIONS_DATABASE_ID = import.meta.env.VITE_NOTION_APPLICATIONS_DB || '';
const MEETINGS_DATABASE_ID = import.meta.env.VITE_NOTION_MEETINGS_DB || '';
const PAYOUTS_DATABASE_ID = import.meta.env.VITE_NOTION_PAYOUTS_DB || '';

const notion = new Client({
  auth: NOTION_TOKEN,
});

// Track last sync times to prevent infinite loops
let lastSyncTimes = {
  tasks: new Map(),
  users: new Map(),
  applications: new Map(),
  meetings: new Map(),
  payouts: new Map()
};

// Bi-directional Notion Sync Service
export const notionSync = {
  // Website → Notion sync
  async syncTaskToNotion(task: any) {
    if (!NOTION_TOKEN || !TASKS_DATABASE_ID) {
      console.log('Notion Tasks DB not configured, skipping sync');
      return;
    }

    try {
      const taskId = task.task_number || `T${task.id}`;
      
      // Prevent sync loops
      const lastSync = lastSyncTimes.tasks.get(taskId);
      if (lastSync && Date.now() - lastSync < 1000) {
        console.log('Skipping task sync to prevent loop:', taskId);
        return;
      }
      
      lastSyncTimes.tasks.set(taskId, Date.now());

      const properties = {
        'Task Number': {
          title: [{ text: { content: taskId } }]
        },
        'Name': {
          rich_text: [{ text: { content: task.name || '' } }]
        },
        'Assigned To': {
          email: task.assigned_to || null
        },
        'Status': {
          select: { name: this.capitalizeFirst(task.status || 'pending') }
        },
        'Priority': {
          select: { name: this.capitalizeFirst(task.priority || 'medium') }
        },
        'Deadline': {
          date: task.deadline ? { start: task.deadline } : null
        },
        'Raw File': {
          url: task.raw_file || null
        },
        'Edited File': {
          url: task.edited_file || null
        },
        'Supabase ID': {
          rich_text: [{ text: { content: task.id?.toString() || '' } }]
        }
      };

      const existingPage = await this.findNotionPageBySupabaseId(TASKS_DATABASE_ID, task.id?.toString());
      
      if (existingPage) {
        await notion.pages.update({
          page_id: existingPage.id,
          properties
        });
        console.log(`✅ Updated task ${taskId} in Notion`);
      } else {
        await notion.pages.create({
          parent: { database_id: TASKS_DATABASE_ID },
          properties
        });
        console.log(`✅ Created task ${taskId} in Notion`);
      }
    } catch (error) {
      console.error('❌ Error syncing task to Notion:', error);
    }
  },

  // Sync meeting to Notion
  async syncMeetingToNotion(meeting: any) {
    if (!NOTION_TOKEN || !MEETINGS_DATABASE_ID) {
      console.log('Notion Meetings DB not configured, skipping sync');
      return;
    }

    try {
      const meetingId = meeting.id?.toString();
      
      const lastSync = lastSyncTimes.meetings.get(meetingId);
      if (lastSync && Date.now() - lastSync < 1000) {
        console.log('Skipping meeting sync to prevent loop:', meetingId);
        return;
      }
      
      lastSyncTimes.meetings.set(meetingId, Date.now());

      const properties = {
        'Title': {
          title: [{ text: { content: meeting.title || '' } }]
        },
        'Date': {
          date: meeting.date ? { start: meeting.date } : null
        },
        'Time': {
          rich_text: [{ text: { content: meeting.time || '' } }]
        },
        'Attendees': {
          multi_select: Array.isArray(meeting.attendees) 
            ? meeting.attendees.map(name => ({ name }))
            : [{ name: meeting.attendees || '' }]
        },
        'Organizer': {
          rich_text: [{ text: { content: meeting.organizer || '' } }]
        },
        'Link': {
          url: meeting.link || null
        },
        'Supabase ID': {
          rich_text: [{ text: { content: meetingId || '' } }]
        }
      };

      const existingPage = await this.findNotionPageBySupabaseId(MEETINGS_DATABASE_ID, meetingId);
      
      if (existingPage) {
        await notion.pages.update({
          page_id: existingPage.id,
          properties
        });
        console.log(`✅ Updated meeting ${meeting.title} in Notion`);
      } else {
        await notion.pages.create({
          parent: { database_id: MEETINGS_DATABASE_ID },
          properties
        });
        console.log(`✅ Created meeting ${meeting.title} in Notion`);
      }
    } catch (error) {
      console.error('❌ Error syncing meeting to Notion:', error);
    }
  },

  // Sync payout to Notion
  async syncPayoutToNotion(payout: any) {
    if (!NOTION_TOKEN || !PAYOUTS_DATABASE_ID) {
      console.log('Notion Payouts DB not configured, skipping sync');
      return;
    }

    try {
      const payoutId = payout.id?.toString();
      
      const lastSync = lastSyncTimes.payouts.get(payoutId);
      if (lastSync && Date.now() - lastSync < 1000) {
        console.log('Skipping payout sync to prevent loop:', payoutId);
        return;
      }
      
      lastSyncTimes.payouts.set(payoutId, Date.now());

      const properties = {
        'Editor': {
          title: [{ text: { content: payout.editor || '' } }]
        },
        'Project': {
          rich_text: [{ text: { content: payout.project || '' } }]
        },
        'Amount': {
          number: payout.amount || 0
        },
        'Status': {
          select: { name: this.capitalizeFirst(payout.status || 'pending') }
        },
        'Edited Link': {
          url: payout.edited_link || null
        },
        'Payment Method': {
          rich_text: [{ text: { content: payout.payment_method || '' } }]
        },
        'Requested Date': {
          date: payout.requested_at ? { start: payout.requested_at.split('T')[0] } : null
        },
        'Supabase ID': {
          rich_text: [{ text: { content: payoutId || '' } }]
        }
      };

      const existingPage = await this.findNotionPageBySupabaseId(PAYOUTS_DATABASE_ID, payoutId);
      
      if (existingPage) {
        await notion.pages.update({
          page_id: existingPage.id,
          properties
        });
        console.log(`✅ Updated payout ${payout.project} in Notion`);
      } else {
        await notion.pages.create({
          parent: { database_id: PAYOUTS_DATABASE_ID },
          properties
        });
        console.log(`✅ Created payout ${payout.project} in Notion`);
      }
    } catch (error) {
      console.error('❌ Error syncing payout to Notion:', error);
    }
  },

  // Notion → Website sync
  async syncTaskFromNotion(notionPage: any) {
    try {
      const properties = notionPage.properties;
      const supabaseId = this.getPropertyValue(properties['Supabase ID'], 'rich_text');
      const taskNumber = this.getPropertyValue(properties['Task Number'], 'title');
      
      const lastSync = lastSyncTimes.tasks.get(taskNumber);
      if (lastSync && Date.now() - lastSync < 1000) {
        console.log('Skipping task sync from Notion to prevent loop:', taskNumber);
        return;
      }
      
      lastSyncTimes.tasks.set(taskNumber, Date.now());

      const taskData = {
        task_number: taskNumber,
        name: this.getPropertyValue(properties['Name'], 'rich_text'),
        assigned_to: this.getPropertyValue(properties['Assigned To'], 'email'),
        status: this.getPropertyValue(properties['Status'], 'select')?.toLowerCase() || 'pending',
        priority: this.getPropertyValue(properties['Priority'], 'select')?.toLowerCase() || 'medium',
        deadline: this.getPropertyValue(properties['Deadline'], 'date'),
        raw_file: this.getPropertyValue(properties['Raw File'], 'url'),
        edited_file: this.getPropertyValue(properties['Edited File'], 'url')
      };

      if (supabaseId) {
        const { error } = await tasksService.updateTask(parseInt(supabaseId), taskData);
        if (error) throw error;
        console.log(`✅ Updated task ${taskNumber} in Supabase from Notion`);
      } else {
        const { data, error } = await tasksService.createTask(taskData);
        if (error) throw error;
        
        if (data) {
          await notion.pages.update({
            page_id: notionPage.id,
            properties: {
              'Supabase ID': {
                rich_text: [{ text: { content: data.id.toString() } }]
              }
            }
          });
        }
        console.log(`✅ Created task ${taskNumber} in Supabase from Notion`);
      }
    } catch (error) {
      console.error('❌ Error syncing task from Notion:', error);
    }
  },

  async syncMeetingFromNotion(notionPage: any) {
    try {
      const properties = notionPage.properties;
      const supabaseId = this.getPropertyValue(properties['Supabase ID'], 'rich_text');
      const title = this.getPropertyValue(properties['Title'], 'title');
      
      const lastSync = lastSyncTimes.meetings.get(supabaseId || title);
      if (lastSync && Date.now() - lastSync < 1000) {
        console.log('Skipping meeting sync from Notion to prevent loop:', title);
        return;
      }
      
      lastSyncTimes.meetings.set(supabaseId || title, Date.now());

      const attendees = properties['Attendees']?.multi_select?.map((item: any) => item.name) || [];

      const meetingData = {
        title: title,
        date: this.getPropertyValue(properties['Date'], 'date'),
        time: this.getPropertyValue(properties['Time'], 'rich_text'),
        attendees: attendees,
        organizer: this.getPropertyValue(properties['Organizer'], 'rich_text'),
        link: this.getPropertyValue(properties['Link'], 'url')
      };

      if (supabaseId) {
        const { error } = await meetingsService.updateMeeting(parseInt(supabaseId), meetingData);
        if (error) throw error;
        console.log(`✅ Updated meeting ${title} in Supabase from Notion`);
      } else {
        const { data, error } = await meetingsService.createMeeting(meetingData);
        if (error) throw error;
        
        if (data) {
          await notion.pages.update({
            page_id: notionPage.id,
            properties: {
              'Supabase ID': {
                rich_text: [{ text: { content: data.id.toString() } }]
              }
            }
          });
        }
        console.log(`✅ Created meeting ${title} in Supabase from Notion`);
      }
    } catch (error) {
      console.error('❌ Error syncing meeting from Notion:', error);
    }
  },

  async syncPayoutFromNotion(notionPage: any) {
    try {
      const properties = notionPage.properties;
      const supabaseId = this.getPropertyValue(properties['Supabase ID'], 'rich_text');
      const project = this.getPropertyValue(properties['Project'], 'rich_text');
      
      const lastSync = lastSyncTimes.payouts.get(supabaseId || project);
      if (lastSync && Date.now() - lastSync < 1000) {
        console.log('Skipping payout sync from Notion to prevent loop:', project);
        return;
      }
      
      lastSyncTimes.payouts.set(supabaseId || project, Date.now());

      const payoutData = {
        editor: this.getPropertyValue(properties['Editor'], 'title'),
        project: project,
        amount: this.getPropertyValue(properties['Amount'], 'number') || 0,
        status: this.getPropertyValue(properties['Status'], 'select')?.toLowerCase() || 'pending',
        edited_link: this.getPropertyValue(properties['Edited Link'], 'url'),
        payment_method: this.getPropertyValue(properties['Payment Method'], 'rich_text')
      };

      if (supabaseId) {
        const { error } = await payoutsService.updatePayout(parseInt(supabaseId), payoutData);
        if (error) throw error;
        console.log(`✅ Updated payout ${project} in Supabase from Notion`);
      } else {
        const { data, error } = await payoutsService.createPayout(payoutData);
        if (error) throw error;
        
        if (data) {
          await notion.pages.update({
            page_id: notionPage.id,
            properties: {
              'Supabase ID': {
                rich_text: [{ text: { content: data.id.toString() } }]
              }
            }
          });
        }
        console.log(`✅ Created payout ${project} in Supabase from Notion`);
      }
    } catch (error) {
      console.error('❌ Error syncing payout from Notion:', error);
    }
  },

  // Start polling Notion for changes (real-time simulation)
  startNotionPolling() {
    if (!NOTION_TOKEN) {
      console.log('Notion not configured, skipping polling');
      return;
    }

    console.log('🔄 Starting Notion polling for real-time sync...');
    
    // Poll every 1 second for near real-time sync
    setInterval(async () => {
      try {
        await this.pollNotionChanges();
      } catch (error) {
        console.error('❌ Error polling Notion:', error);
      }
    }, 1000);
  },

  async pollNotionChanges() {
    try {
      const recentThreshold = Date.now() - 5000; // Check last 5 seconds
      
      // Poll tasks
      if (TASKS_DATABASE_ID) {
        const tasksResponse = await notion.databases.query({
          database_id: TASKS_DATABASE_ID,
          sorts: [{ property: 'Last edited time', direction: 'descending' }]
        });

        for (const page of tasksResponse.results.slice(0, 5)) {
          const lastEditedTime = new Date(page.last_edited_time).getTime();
          if (lastEditedTime > recentThreshold) {
            console.log('🔄 Detected task change in Notion, syncing...');
            await this.syncTaskFromNotion(page);
          }
        }
      }

      // Poll meetings
      if (MEETINGS_DATABASE_ID) {
        const meetingsResponse = await notion.databases.query({
          database_id: MEETINGS_DATABASE_ID,
          sorts: [{ property: 'Last edited time', direction: 'descending' }]
        });

        for (const page of meetingsResponse.results.slice(0, 5)) {
          const lastEditedTime = new Date(page.last_edited_time).getTime();
          if (lastEditedTime > recentThreshold) {
            console.log('🔄 Detected meeting change in Notion, syncing...');
            await this.syncMeetingFromNotion(page);
          }
        }
      }

      // Poll payouts
      if (PAYOUTS_DATABASE_ID) {
        const payoutsResponse = await notion.databases.query({
          database_id: PAYOUTS_DATABASE_ID,
          sorts: [{ property: 'Last edited time', direction: 'descending' }]
        });

        for (const page of payoutsResponse.results.slice(0, 5)) {
          const lastEditedTime = new Date(page.last_edited_time).getTime();
          if (lastEditedTime > recentThreshold) {
            console.log('🔄 Detected payout change in Notion, syncing...');
            await this.syncPayoutFromNotion(page);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error polling Notion changes:', error);
    }
  },

  // Sync user to Notion
  async syncUserToNotion(user: any) {
    if (!NOTION_TOKEN || !USERS_DATABASE_ID) return;

    try {
      const properties = {
        'Name': {
          title: [{ text: { content: user.display_name || user.name || '' } }]
        },
        'Email': {
          email: user.email || null
        },
        'Role': {
          select: { name: this.capitalizeFirst(user.role || 'editor') }
        },
        'Status': {
          select: { name: user.approved ? 'Active' : 'Pending' }
        },
        'Supabase ID': {
          rich_text: [{ text: { content: user.id?.toString() || '' } }]
        }
      };

      const existingPage = await this.findNotionPageBySupabaseId(USERS_DATABASE_ID, user.id?.toString());
      
      if (existingPage) {
        await notion.pages.update({
          page_id: existingPage.id,
          properties
        });
        console.log(`✅ Updated user ${user.email} in Notion`);
      } else {
        await notion.pages.create({
          parent: { database_id: USERS_DATABASE_ID },
          properties
        });
        console.log(`✅ Created user ${user.email} in Notion`);
      }
    } catch (error) {
      console.error('❌ Error syncing user to Notion:', error);
    }
  },

  // Sync application to Notion
  async syncApplicationToNotion(application: any) {
    if (!NOTION_TOKEN || !APPLICATIONS_DATABASE_ID) return;

    try {
      const properties = {
        'Name': {
          title: [{ text: { content: application.name || '' } }]
        },
        'Email': {
          email: application.email || null
        },
        'Status': {
          select: { name: this.capitalizeFirst(application.status || 'pending') }
        },
        'Software': {
          rich_text: [{ text: { content: application.software || '' } }]
        },
        'Portfolio': {
          url: application.portfolio || null
        },
        'Applied Date': {
          date: application.applied_at ? { start: application.applied_at.split('T')[0] } : null
        },
        'Supabase ID': {
          rich_text: [{ text: { content: application.id?.toString() || '' } }]
        }
      };

      const existingPage = await this.findNotionPageBySupabaseId(APPLICATIONS_DATABASE_ID, application.id?.toString());
      
      if (existingPage) {
        await notion.pages.update({
          page_id: existingPage.id,
          properties
        });
        console.log(`✅ Updated application ${application.email} in Notion`);
      } else {
        await notion.pages.create({
          parent: { database_id: APPLICATIONS_DATABASE_ID },
          properties
        });
        console.log(`✅ Created application ${application.email} in Notion`);
      }
    } catch (error) {
      console.error('❌ Error syncing application to Notion:', error);
    }
  },

  // Bulk sync all data
  async syncAllToNotion() {
    console.log('🔄 Starting bulk sync to Notion...');
    
    try {
      // Sync all tasks
      const { data: tasks } = await supabase.from('tasks').select('*');
      if (tasks) {
        for (const task of tasks) {
          await this.syncTaskToNotion(task);
          await this.delay(200);
        }
      }

      // Sync all meetings
      const { data: meetings } = await supabase.from('meetings').select('*');
      if (meetings) {
        for (const meeting of meetings) {
          await this.syncMeetingToNotion(meeting);
          await this.delay(200);
        }
      }

      // Sync all payouts
      const { data: payouts } = await supabase.from('payouts').select('*');
      if (payouts) {
        for (const payout of payouts) {
          await this.syncPayoutToNotion(payout);
          await this.delay(200);
        }
      }

      // Sync all users
      const { data: users } = await supabase.from('users').select('*');
      if (users) {
        for (const user of users) {
          await this.syncUserToNotion(user);
          await this.delay(200);
        }
      }

      // Sync all applications
      const { data: applications } = await supabase.from('applications').select('*');
      if (applications) {
        for (const application of applications) {
          await this.syncApplicationToNotion(application);
          await this.delay(200);
        }
      }

      console.log('✅ Bulk sync completed!');
    } catch (error) {
      console.error('❌ Error in bulk sync:', error);
    }
  },

  // Helper functions
  async findNotionPageBySupabaseId(databaseId: string, supabaseId: string) {
    if (!supabaseId) return null;
    
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Supabase ID',
          rich_text: {
            equals: supabaseId
          }
        }
      });
      return response.results[0] || null;
    } catch (error) {
      console.error('❌ Error finding Notion page:', error);
      return null;
    }
  },

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
      default:
        return null;
    }
  },

  capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Auto-sync functions for real-time updates
export const setupNotionSync = () => {
  console.log('🚀 Setting up bi-directional Notion sync...');
  
  // Website → Notion sync (real-time via Supabase)
  supabase
    .channel('notion-sync-tasks')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tasks' },
      (payload) => {
        console.log('📤 Task changed in website, syncing to Notion:', payload);
        if (payload.new) {
          notionSync.syncTaskToNotion(payload.new);
        }
      }
    )
    .subscribe();

  supabase
    .channel('notion-sync-meetings')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'meetings' },
      (payload) => {
        console.log('📤 Meeting changed in website, syncing to Notion:', payload);
        if (payload.new) {
          notionSync.syncMeetingToNotion(payload.new);
        }
      }
    )
    .subscribe();

  supabase
    .channel('notion-sync-payouts')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'payouts' },
      (payload) => {
        console.log('📤 Payout changed in website, syncing to Notion:', payload);
        if (payload.new) {
          notionSync.syncPayoutToNotion(payload.new);
        }
      }
    )
    .subscribe();

  supabase
    .channel('notion-sync-users')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users' },
      (payload) => {
        console.log('📤 User changed in website, syncing to Notion:', payload);
        if (payload.new) {
          notionSync.syncUserToNotion(payload.new);
        }
      }
    )
    .subscribe();

  supabase
    .channel('notion-sync-applications')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'applications' },
      (payload) => {
        console.log('📤 Application changed in website, syncing to Notion:', payload);
        if (payload.new) {
          notionSync.syncApplicationToNotion(payload.new);
        }
      }
    )
    .subscribe();

  // Notion → Website sync (polling every 1 second)
  notionSync.startNotionPolling();
  
  console.log('✅ Bi-directional sync active!');
};