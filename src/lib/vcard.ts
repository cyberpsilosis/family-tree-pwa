interface VCardData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  birthday?: Date | string;
  profilePhotoUrl?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
}

export function generateVCard(user: VCardData): string {
  const lines: string[] = [];

  // Start vCard
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');

  // Name
  lines.push(`FN:${user.firstName} ${user.lastName}`);
  lines.push(`N:${user.lastName};${user.firstName};;;`);

  // Email
  if (user.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${user.email}`);
  }

  // Phone
  if (user.phone) {
    lines.push(`TEL;TYPE=CELL:${user.phone}`);
  }

  // Address
  if (user.address) {
    // Format: street;city;state;zip;country
    lines.push(`ADR;TYPE=HOME:;;${user.address};;;;`);
  }

  // Birthday (format: YYYY-MM-DD or YYYYMMDD)
  if (user.birthday) {
    const date = typeof user.birthday === 'string' 
      ? new Date(user.birthday) 
      : user.birthday;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    lines.push(`BDAY:${year}${month}${day}`);
  }

  // Photo URL
  if (user.profilePhotoUrl) {
    lines.push(`PHOTO;VALUE=URI:${user.profilePhotoUrl}`);
  }

  // Social media as URLs
  if (user.instagram) {
    lines.push(`URL;TYPE=Instagram:${user.instagram}`);
  }
  if (user.facebook) {
    lines.push(`URL;TYPE=Facebook:${user.facebook}`);
  }
  if (user.twitter) {
    lines.push(`URL;TYPE=Twitter:${user.twitter}`);
  }
  if (user.linkedin) {
    lines.push(`URL;TYPE=LinkedIn:${user.linkedin}`);
  }

  // End vCard
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function downloadVCard(user: VCardData): void {
  const vcard = generateVCard(user);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${user.firstName}_${user.lastName}.vcf`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
