"use client"

import {BsClockHistory, BsFillPeopleFill} from "react-icons/bs";
import Widget from "@/components/Widget";
import Card from "@/components/Card";
import LineChart from "@/components/LineChart";
import axios from "@/lib/axios";
import useSWR from "swr";
import Input from "@/components/Input";
import PrimaryButton from "@/components/PrimaryButton";
import useForm from "@/hooks/form";

export default function Dashboard() {

    const { data } = useSWR('/api/metrics', (url) => axios.get(url).then((response) => response.data), { refreshInterval: 1000 })

    const chartOptions = {
        chart: {
            id: "users-chart",
            toolbar: {
                show: false,
            },
            dataLabels: {
                enabled: false,
            }
        },
        xaxis: {
            categories: data?.history?.labels
        },
        stroke: {
            curve: 'smooth',
        },
    };

    const chartSeries = [
        {
            name: "Users",
            data: data?.history ? data.history.data : []
        }
    ]

    const {data:usersData, processing, setData, get} = useForm({ numberUsers: 30})
    const generateUsers = () => {
        get('/api/createUsers/'+usersData.numberUsers, {

        });
    }

    return (
        <div className="my-3 lg:my-8">
            <div className="max-w-7xl mx-auto px-3 lg:px-8 space-y-6">

                <div className="my-3 lg:my-6 grid grid-cols-1 gap-3 lg:gap-6 md:grid-cols-3">

                    <Widget
                        icon={<BsFillPeopleFill className="h-7 w-7"/>}
                        title={'Total users'}
                        subtitle={data?.users}
                    />

                    <Widget
                        icon={<BsClockHistory className="h-7 w-7"/>}
                        title={'Users in last 30 days'}
                        subtitle={data?.usersLast30Days}
                    />

                    <Card extra="!flex-row flex-grow items-center h-[90px] p-[18px] gap-5">

                        <Input
                            type="number"
                            min="10"
                            max="200"
                            value={usersData.numberUsers}
                            className="block mt-1 w-full"
                            onChange={(event) => setData('numberUsers',event.target.value)}
                            required
                        />

                        <PrimaryButton disabled={processing} onClick={() => generateUsers()} className="text-nowrap">Generate users</PrimaryButton>

                    </Card>
                </div>

                <Card extra="!p-[20px] my-3 lg:my-6">

                    <div
                        className="flex flex-col h-full w-full justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
                        <p className="mt-[20px] font-semibold text-xl text-navy-700 dark:text-white">
                            Users registered in last 6 months
                        </p>
                        <div className="h-full w-full">
                            <LineChart
                                chartOptions={chartOptions}
                                chartData={chartSeries}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
