import { createPropertySchema } from './src/lib/validations/property';
console.log(createPropertySchema.safeParse({ title: 'A', address: 'B', city: 'C', type: 'apartment', bedrooms: 1, bathrooms: 1, monthlyRent: '1000', available: true, availableFrom: null, description: '', epcRating: null, postcode: '', landlordName: '', ownerPhone: '' }));
