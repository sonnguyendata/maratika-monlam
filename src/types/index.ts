export type Language = 'vi' | 'en' | 'zh';

export type InputMode = 'direct' | 'mala';

export interface SubmissionData {
  attendee_id: string;
  attendee_name: string;
  quantity: number;
  note?: string;
  idempotency_key: string;
  input_mode?: InputMode;
  mala_count?: number;
  mala_type?: number;
}

export interface SubmissionResponse {
  ok: boolean;
  daily_total?: number;
  total_count?: number;
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
  nav: {
    record: string;
    report: string;
    schedule: string;
    info: string;
  };
  app: {
    title: string;
    subtitle: string;
    event_dates: string;
  };
  record: {
    title: string;
    id: string;
    id_placeholder: string;
    phone: string;
    phone_placeholder: string;
    name: string;
    name_placeholder: string;
    quantity: string;
    quantity_placeholder: string;
    input_mode: string;
    direct_input: string;
    mala_input: string;
    select_mala_type: string;
    mala_count_placeholder: string;
    note: string;
    note_placeholder: string;
    submit: string;
    success: string;
    todayTotal: string;
    totalCount: string;
    quick_add: {
      add_7: string;
      add_21: string;
      add_108: string;
    };
  };
  report: {
    title: string;
    kpi_total: string;
    kpi_today: string;
    kpi_unique: string;
    daily_chart: string;
    top10: string;
    rank: string;
    name: string;
    total: string;
  };
  schedule: {
    title: string;
    day1: string;
    day2: string;
    day3: string;
    day4: string;
    day5: string;
  };
  info: {
    title: string;
    purpose: string;
    dates_place: string;
    contact: string;
    register: string;
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
    filters: {
      by_date: string;
      by_id: string;
      by_name: string;
      qty_range: string;
      flags_only: string;
    };
    flags: {
      spike: string;
      burst: string;
      duplicate: string;
      same_ip: string;
    };
    actions: {
      export_csv: string;
      mark_reviewed: string;
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
