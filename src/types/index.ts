export type Language = 'vi' | 'en';

export interface SubmissionData {
  attendee_id: string;
  attendee_name: string;
  quantity: number;
  note?: string;
  idempotency_key: string;
}

export interface SubmissionResponse {
  ok: boolean;
  daily_total?: number;
  error?: string;
}

export interface ReportSummary {
  totals: {
    all_time: number;
    today: number;
    unique_ids: number;
  };
  by_day: Array<{
    date: string;
    total: number;
  }>;
  top10: Array<{
    id: string;
    name: string;
    total: number;
    submission_count: number;
  }>;
}

export interface AdminRecord {
  id: number;
  attendee_id: string;
  attendee_name: string;
  quantity: number;
  note?: string;
  ts_server: string;
  ip_hash?: string;
  ua_hash?: string;
  flagged: boolean;
  flag_reason?: string;
  idempotency_key?: string;
}

export interface AdminFilters {
  date_from?: string;
  date_to?: string;
  attendee_id?: string;
  attendee_name?: string;
  quantity_min?: number;
  quantity_max?: number;
  flagged_only?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminResponse {
  records: AdminRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type FlagReason = 'BurstByID' | 'SpikeByQty' | 'DupKey' | 'MultiAccountSameIP';

export interface I18nMessages {
  common: {
    loading: string;
    error: string;
    success: string;
    submit: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    view: string;
    export: string;
    filter: string;
    search: string;
    refresh: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    total: string;
    page: string;
    of: string;
  };
  navigation: {
    home: string;
    submit: string;
    report: string;
    admin: string;
    language: string;
  };
  app: {
    title: string;
    subtitle: string;
    event_dates: string;
  };
  form: {
    attendee_id: string;
    attendee_id_placeholder: string;
    attendee_name: string;
    attendee_name_placeholder: string;
    quantity: string;
    quantity_placeholder: string;
    note: string;
    note_placeholder: string;
    required: string;
    min_quantity: string;
    invalid_quantity: string;
  };
  submission: {
    success: string;
    success_message: string;
    daily_total: string;
    duplicate_warning: string;
    error_message: string;
  };
  report: {
    title: string;
    kpis: {
      total_all_time: string;
      total_today: string;
      unique_participants: string;
      last_updated: string;
    };
    chart: {
      title: string;
      x_axis: string;
      y_axis: string;
    };
    leaderboard: {
      title: string;
      rank: string;
      name: string;
      total: string;
      submissions: string;
    };
  };
  admin: {
    title: string;
    login: {
      title: string;
      username: string;
      password: string;
      login_button: string;
      invalid_credentials: string;
    };
    dashboard: {
      title: string;
      records_table: string;
      filters: string;
      actions: string;
    };
    table: {
      timestamp: string;
      attendee_id: string;
      attendee_name: string;
      quantity: string;
      note: string;
      ip_hash: string;
      ua_hash: string;
      flagged: string;
      flag_reason: string;
      actions: string;
    };
    filters: {
      date_from: string;
      date_to: string;
      attendee_id: string;
      attendee_name: string;
      quantity_min: string;
      quantity_max: string;
      flagged_only: string;
      apply: string;
      clear: string;
    };
    flags: {
      BurstByID: string;
      SpikeByQty: string;
      DupKey: string;
      MultiAccountSameIP: string;
    };
    actions: {
      export_csv: string;
      mark_reviewed: string;
      flag: string;
      unflag: string;
    };
  };
  errors: {
    network: string;
    server: string;
    validation: string;
    unauthorized: string;
    not_found: string;
    rate_limit: string;
  };
}
