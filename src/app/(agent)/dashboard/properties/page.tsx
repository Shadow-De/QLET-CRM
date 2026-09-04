import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { PropertyTable } from '@/components/PropertyTable'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, reference: true, city: true, ownerName: true,
      ownerMobile: true, propertyType: true, price: true,
      available: true, availableFrom: true, notes: true, createdAt: true,
    },
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Properties</h1>
        <p className="text-sm text-text-muted mt-1">{properties.length} properties</p>
      </div>
      <PropertyTable initialProperties={properties} />
    </div>
  )
}
