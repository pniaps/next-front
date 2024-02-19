import TableWrapper from "@/components/table";
import axios from "@/lib/axios";

export const metadata = {
    title: 'Users | Next',
}

export default async function usersPage() {

    const data = await axios.get('/api/users').then((response) => response.data.data)

    const columns = [
        {key: "name", label: "Name",},
        {key: "email", label: "Email",},
        {key: "registered", label: "Registered",},
    ];

    return (
        <div className="my-5">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <TableWrapper label={'Users table'} columns={columns} rows={data} />
                    </div>
                </div>
            </div>
        </div>
    )
}
