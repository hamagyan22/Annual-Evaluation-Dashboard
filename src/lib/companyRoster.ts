export interface CompanyEmployee {
  id: string;
  agent_name: string;
  name: string;
  team: string;
}

// Complete official contact center roster (38 agents across all 3 teams)
// Guaranteed immediate zero-latency availability across all components
export const DEFAULT_COMPANY_EMPLOYEES: CompanyEmployee[] = [
  // Younis Kamal Team (12 agents)
  { id: "ahmed_jalil", agent_name: "Ahmed Jalil", name: "Ahmed Jalil", team: "Younis Kamal Team" },
  { id: "amar_hussein_salih", agent_name: "Amar Hussein Salih", name: "Amar Hussein Salih", team: "Younis Kamal Team" },
  { id: "azad_muhammad", agent_name: "Azad Muhammad", name: "Azad Muhammad", team: "Younis Kamal Team" },
  { id: "haseeb_adeeb", agent_name: "Haseeb Adeeb", name: "Haseeb Adeeb", team: "Younis Kamal Team" },
  { id: "hewr_adnan", agent_name: "Hewr Adnan", name: "Hewr Adnan", team: "Younis Kamal Team" },
  { id: "kazhvan_wirya", agent_name: "Kazhvan Wirya", name: "Kazhvan Wirya", team: "Younis Kamal Team" },
  { id: "laveen_khaleel", agent_name: "Laveen Khaleel", name: "Laveen Khaleel", team: "Younis Kamal Team" },
  { id: "mokhalad_ali", agent_name: "Mokhalad Ali", name: "Mokhalad Ali", team: "Younis Kamal Team" },
  { id: "rabar_mohammed", agent_name: "Rabar Mohammed", name: "Rabar Mohammed", team: "Younis Kamal Team" },
  { id: "salam_sadam_muhammad", agent_name: "Salam Sadam Muhammad", name: "Salam Sadam Muhammad", team: "Younis Kamal Team" },
  { id: "sarbaz_namiq_hasan", agent_name: "Sarbaz Namiq Hasan", name: "Sarbaz Namiq Hasan", team: "Younis Kamal Team" },
  { id: "shahab_ahmed_muhammed", agent_name: "Shahab Ahmed Muhammed", name: "Shahab Ahmed Muhammed", team: "Younis Kamal Team" },
  { id: "mohammed_salem", agent_name: "Mohammed Salem", name: "Mohammed Salem", team: "Younis Kamal Team" },

  // Ankido Buya Team (13 agents)
  { id: "alla_satar", agent_name: "Alla Satar", name: "Alla Satar", team: "Ankido Buya Team" },
  { id: "aya_yasin", agent_name: "Aya Yasin", name: "Aya Yasin", team: "Ankido Buya Team" },
  { id: "frmesk_younis", agent_name: "Frmesk Younis", name: "Frmesk Younis", team: "Ankido Buya Team" },
  { id: "haneen_abd_al_kareem", agent_name: "Haneen Abd-Al Kareem", name: "Haneen Abd-Al Kareem", team: "Ankido Buya Team" },
  { id: "kani_sami", agent_name: "Kani Sami", name: "Kani Sami", team: "Ankido Buya Team" },
  { id: "lana_halmat_rafeeq", agent_name: "Lana Halmat Rafeeq", name: "Lana Halmat Rafeeq", team: "Ankido Buya Team" },
  { id: "marwa_khalil", agent_name: "Marwa Khalil", name: "Marwa Khalil", team: "Ankido Buya Team" },
  { id: "muzhda_omar_ali", agent_name: "Muzhda Omar Ali", name: "Muzhda Omar Ali", team: "Ankido Buya Team" },
  { id: "saja_bashar_anwar", agent_name: "Saja Bashar Anwar", name: "Saja Bashar Anwar", team: "Ankido Buya Team" },
  { id: "taban_sirwan", agent_name: "Taban Sirwan", name: "Taban Sirwan", team: "Ankido Buya Team" },
  { id: "zainab_khalid_rasheed", agent_name: "Zainab Khalid Rasheed", name: "Zainab Khalid Rasheed", team: "Ankido Buya Team" },
  { id: "zhalla_salam", agent_name: "Zhalla Salam", name: "Zhalla Salam", team: "Ankido Buya Team" },
  { id: "zhalla_sherzad", agent_name: "Zhalla Sherzad", name: "Zhalla Sherzad", team: "Ankido Buya Team" },

  // Mohammed Dlshad Team (13 agents)
  { id: "ahmed_rustam", agent_name: "Ahmed Rustam", name: "Ahmed Rustam", team: "Mohammed Dlshad Team" },
  { id: "akar_omer", agent_name: "Akar Omer", name: "Akar Omer", team: "Mohammed Dlshad Team" },
  { id: "bana_ahmed", agent_name: "Bana Ahmed", name: "Bana Ahmed", team: "Mohammed Dlshad Team" },
  { id: "dhuha_khanjer", agent_name: "Dhuha Khanjer", name: "Dhuha Khanjer", team: "Mohammed Dlshad Team" },
  { id: "ismail_ahmed", agent_name: "Ismail Ahmed", name: "Ismail Ahmed", team: "Mohammed Dlshad Team" },
  { id: "nawen_maadh", agent_name: "Nawen Maadh", name: "Nawen Maadh", team: "Mohammed Dlshad Team" },
  { id: "ossama_saadi", agent_name: "Ossama Saadi", name: "Ossama Saadi", team: "Mohammed Dlshad Team" },
  { id: "rassan_ismail", agent_name: "Rassan Ismail", name: "Rassan Ismail", team: "Mohammed Dlshad Team" },
  { id: "sana_dler", agent_name: "Sana Dler", name: "Sana Dler", team: "Mohammed Dlshad Team" },
  { id: "sawen", agent_name: "Sawen", name: "Sawen", team: "Mohammed Dlshad Team" },
  { id: "soma_sherko", agent_name: "Soma Sherko", name: "Soma Sherko", team: "Mohammed Dlshad Team" },
  { id: "yousif_rashid", agent_name: "Yousif Rashid", name: "Yousif Rashid", team: "Mohammed Dlshad Team" },
  { id: "zahra_yousif", agent_name: "Zahra Yousif", name: "Zahra Yousif", team: "Mohammed Dlshad Team" },
];
