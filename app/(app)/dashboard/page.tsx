"use client"

import {BsClockHistory, BsFillPeopleFill} from "react-icons/bs";
import Widget from "@/components/Widget";
import Card from "@/components/Card";
import LineChart from "@/components/LineChart";
import axios from "@/lib/axios";
import useSWR from "swr";

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

    return (
        <div className="my-5">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">

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

                </div>

                <Card extra="!p-[20px] mt-5">

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
