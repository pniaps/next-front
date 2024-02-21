"use client"

import TableWrapper from "@/components/table";
import axios from "@/lib/axios";

export default async function usersPage() {

    const data = await axios.get('/api/users').then((response) => response.data.data)

    const columns = [
        {key: "name", label: "Name",},
        {key: "email", label: "Email",},
        {key: "registered", label: "Registered",},
    ];

    return (
        <div className="my-3 lg:my-8">
            <div className="max-w-7xl mx-auto px-3 lg:px-8 space-y-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-3 lg:p-8 bg-white border-b border-gray-200">
                        <TableWrapper label={'Users table'} columns={columns} rows={data} />
                    </div>
                </div>
            </div>
        </div>
    )
}
