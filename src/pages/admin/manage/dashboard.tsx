import { HandCoins, ListOrderedIcon, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useManageDashboard } from "@/hook/admin/use-dashboard";
import { ChartBarRevenue } from "../components/dashboard/revenue-chart";
import { ChartPieOrder } from "../components/dashboard/pie-order-chart";
import { ChartAreaUser } from "../components/dashboard/user-area-chart";
import { ChartAreaOrder } from "../components/dashboard/order-area-chart";
import TopListTabs from "../components/dashboard/table-top";
import { ElegantCard } from "../components/dashboard/card-infor";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getPastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

const RenderDashboard = () => {
  const today = formatDate(new Date());
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);

  const body = useMemo(() => ({ fromDate, toDate }), [fromDate]);
  const {
    revenueChart,
    dataPieOrderChart,
    dataAreaUserChart,
    dataAreaOrderChart,
    dataTopCategory,
    dataTopProduct,
    isPending,
  } = useManageDashboard(body);
  const cards = useMemo(
    () => [
      {
        title: "Tổng doanh thu",
        icon: <HandCoins className="text-yellow-700" />,
        value: revenueChart
          ? revenueChart.reduce((sum, item) => sum + item.revenue, 0)
          : 0,
        clickable: false,
      },
      {
        title: "Tổng đơn hàng",
        icon: <ListOrderedIcon className="text-green-700" />,
        value: dataAreaOrderChart
          ? dataAreaOrderChart.reduce((sum, item) => sum + item.orders, 0)
          : 0,
        clickable: true,
        onClick: () => navigate("/admin/order-manage"),
      },
      {
        title: "Tổng người dùng",
        icon: <User className="text-gray-700" />,
        value: dataAreaUserChart
          ? dataAreaUserChart.reduce((sum, item) => sum + item.newUsers, 0)
          : 0,
        clickable: true,
        onClick: () => navigate("/admin/user-manage"),
      },
    ],
    [dataAreaUserChart, dataAreaOrderChart, revenueChart, navigate]
  );
  const handleSelectRange = (range: "today" | "7days" | "30days") => {
    const today = formatDate(new Date());

    if (range === "today") {
      setFromDate(today);
      setToDate(today);
    }

    if (range === "7days") {
      setFromDate(getPastDate(7));
      setToDate(today);
    }

    if (range === "30days") {
      setFromDate(getPastDate(30));
      setToDate(today);
    }
  };
  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="text-3xl font-bold">Dashboard</div>
      </div>
      <Tabs defaultValue="today" className="w-[400px] mb-3">
        <TabsList>
          <TabsTrigger
            className="px-3 cursor-pointer"
            value="today"
            onClick={() => handleSelectRange("today")}
          >
            Hôm nay
          </TabsTrigger>
          <TabsTrigger
            className="px-3 cursor-pointer"
            value="week"
            onClick={() => handleSelectRange("7days")}
          >
            7 ngày{" "}
          </TabsTrigger>
          <TabsTrigger
            className="px-3 cursor-pointer"
            value="month"
            onClick={() => handleSelectRange("30days")}
          >
            30 ngày{" "}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4  mb-3 ">
        {cards.map((card, index) => (
          <div key={`${index}-${card.title}`} className="col-span-1">
            <ElegantCard
              title={card.title}
              icon={card.icon}
              value={card.value}
              isPending={isPending}
              onClick={card.onClick}
              clickable={card.clickable}
            />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <ChartBarRevenue data={revenueChart} isPending={isPending} />
          </div>

          <div className="col-span-1">
            <ChartPieOrder data={dataPieOrderChart} isPending={isPending} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-1/2">
            {" "}
            <ChartAreaUser data={dataAreaUserChart} isPending={isPending} />
          </div>
          <div className="w-1/2">
            <ChartAreaOrder data={dataAreaOrderChart} />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <TopListTabs products={dataTopProduct} categories={dataTopCategory} />
      </div>

      {/* Booking Table */}
      {/* <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">
            Todays Booking{" "}
            <span className="text-xs font-normal text-gray-500">
              (8 Guest today)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="stays" className="w-full">
            <TabsList className="mb-4 border-b w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="stays"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("stays")}
              >
                Stays
              </TabsTrigger>
              <TabsTrigger
                value="packages"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("packages")}
              >
                Packages
              </TabsTrigger>
              <TabsTrigger
                value="arrivals"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("arrivals")}
              >
                Arrivals
              </TabsTrigger>
              <TabsTrigger
                value="departure"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("departure")}
              >
                Departure
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guest by name or phone number or booking ID"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-[400px] text-sm"
                />
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Booking
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        NAME <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      BOOKING ID
                    </TableHead>
                    <TableHead className="whitespace-nowrap">NIGHTS</TableHead>
                    <TableHead className="whitespace-nowrap">
                      ROOM TYPE
                    </TableHead>
                    <TableHead className="whitespace-nowrap">GUESTS</TableHead>
                    <TableHead className="whitespace-nowrap">PAID</TableHead>
                    <TableHead className="whitespace-nowrap">COST</TableHead>
                    <TableHead className="whitespace-nowrap">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingData.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage
                              src={booking.avatar}
                              alt={booking.name}
                            />
                            <AvatarFallback>
                              {booking.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{booking.name}</p>
                            <p className="text-xs text-gray-500">
                              {booking.phone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.bookingId}</TableCell>
                      <TableCell>{booking.nights}</TableCell>
                      <TableCell>
                        {Array.isArray(booking.roomType) ? (
                          <div>
                            {booking.roomType.map((type, index) => (
                              <p key={index}>{type}</p>
                            ))}
                          </div>
                        ) : (
                          booking.roomType
                        )}
                      </TableCell>
                      <TableCell>{booking.guests} Guests</TableCell>
                      <TableCell>
                        {booking.paid === "paid" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                            paid
                          </span>
                        ) : (
                          booking.paid
                        )}
                      </TableCell>
                      <TableCell>{booking.cost}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="link"
                className="text-blue-500 hover:text-blue-600"
              >
                See other Bookings
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card> */}

      {/* Calendar and Rating */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base font-medium">Calender</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium">August 2023</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <div className="py-1 font-medium">SU</div>
              <div className="py-1 font-medium">MO</div>
              <div className="py-1 font-medium">TU</div>
              <div className="py-1 font-medium">WE</div>
              <div className="py-1 font-medium">TH</div>
              <div className="py-1 font-medium">FR</div>
              <div className="py-1 font-medium">SA</div>

              <div className="py-1 text-gray-400">31</div>
              <div className="py-1">1</div>
              <div className="py-1 relative">
                2
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
              </div>
              <div className="py-1">3</div>
              <div className="py-1">4</div>
              <div className="py-1">5</div>
              <div className="py-1">6</div>

              <div className="py-1">7</div>
              <div className="py-1">8</div>
              <div className="py-1 relative">
                9
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
              </div>
              <div className="py-1">10</div>
              <div className="py-1">11</div>
              <div className="py-1">12</div>
              <div className="py-1">13</div>

              <div className="py-1">14</div>
              <div className="py-1">15</div>
              <div className="py-1">16</div>
              <div className="py-1">17</div>
              <div className="py-1">18</div>
              <div className="py-1">19</div>
              <div className="py-1">20</div>

              <div className="py-1">21</div>
              <div className="py-1">22</div>
              <div className="py-1">23</div>
              <div className="py-1 relative">
                24
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
              </div>
              <div className="py-1">25</div>
              <div className="py-1">26</div>
              <div className="py-1">27</div>

              <div className="py-1">28</div>
              <div className="py-1">29</div>
              <div className="py-1">30</div>
              <div className="py-1">31</div>
              <div className="py-1 text-gray-400">1</div>
              <div className="py-1 text-gray-400">2</div>
              <div className="py-1 text-gray-400">3</div>
            </div>

            <div className="mt-6 border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">
                August 02, 2023 Booking Lists
              </h4>
              <p className="text-xs text-gray-500 mb-3">(3 Bookings)</p>

              <div className="space-y-3">
                {calendarEvents.map((event, index) => (
                  <div key={index} className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt={event.guest}
                      />
                      <AvatarFallback>
                        {event.guest
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{event.guest}</p>
                      <p className="text-xs text-gray-500">
                        {event.nights} Nights | {event.guests} Guests
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
            <CardTitle className="text-base font-medium">
              Overall Rating
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  This Week <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>This Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-24">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path
                    d="M 0 50 A 50 50 0 0 1 100 50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <path
                    d="M 0 50 A 50 50 0 0 1 90 50"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="10"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-medium">Rating</p>
                    <p className="text-2xl font-bold">4.5/5</p>
                    <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded">
                      +31%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cleanliness</span>
                <div className="flex items-center gap-2">
                  <Progress value={90} className="h-2 w-32" />
                  <span className="text-sm">4.5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Facilities</span>
                <div className="flex items-center gap-2">
                  <Progress value={90} className="h-2 w-32" />
                  <span className="text-sm">4.5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Location</span>
                <div className="flex items-center gap-2">
                  <Progress value={50} className="h-2 w-32" />
                  <span className="text-sm">2.5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Room Comfort</span>
                <div className="flex items-center gap-2">
                  <Progress value={50} className="h-2 w-32" />
                  <span className="text-sm">2.5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Service</span>
                <div className="flex items-center gap-2">
                  <Progress value={76} className="h-2 w-32" />
                  <span className="text-sm">3.8</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Value for money</span>
                <div className="flex items-center gap-2">
                  <Progress value={76} className="h-2 w-32" />
                  <span className="text-sm">3.8</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </>
  );
};
export default RenderDashboard;
