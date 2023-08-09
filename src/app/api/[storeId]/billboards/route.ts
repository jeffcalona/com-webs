import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth()
        const body = await req.json()

        const { label, imageUrl } = body

        if(!userId) {
            return new NextResponse('No autenticado', { status: 401 })
        }

        if(!label) {
            return new NextResponse('El nombre de la imagen de portada es requerido', { status: 400 })
        }

        if(!imageUrl) {
            return new NextResponse('La imagen de portada es requerida', { status: 400 })
        }

        if (!params.storeId) {
            return new NextResponse('El Id de la tienda es requerido', { status: 400 })
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        //Cuando el usuario está logeado pero no tiene los permisos para modificar el tablero
        if (!storeByUserId) {
            return new NextResponse('No autorizado', { status: 403 })
        }

        const billboard = await prismadb.billboard.create({
            data: {
                label,
                imageUrl,
                storeId: params.storeId

            }
        })

        return NextResponse.json(billboard)

    } catch (error) {
        console.log('[BILLBOARDS_POST]', error)
        return new NextResponse('Error interno', { status: 500 })
    }
}

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {

        if (!params.storeId) {
            return new NextResponse('El Id de la tienda es requerido', { status: 400 })
        }

        const billboards = await prismadb.billboard.findMany({
            where: {
                storeId: params.storeId
            }
        })

        return NextResponse.json(billboards)

    } catch (error) {
        console.log('[BILLBOARDS_GET]', error)
        return new NextResponse('Error interno', { status: 500 })
    }
}