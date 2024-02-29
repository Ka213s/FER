import React, { useState, useEffect } from 'react';
import CallApi from '../CallApi';
import axios from 'axios';
import CustomerMenu from './customer-menu';
import UserCustomer from '../../list/userCustomer';

export default function Customerdondat() {
    const [reservationId, setReservationId] = useState(null);
    const [realEstateId, setRealEstateId] = useState(null);
    const [loading, setLoading] = useState(false); // State để kiểm soát trạng thái tải
    const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));
    const customerId = userLoginBasicInformationDto?.accountId;

    useEffect(() => {
        async function fetchData() {
            try {
                const callDataReservations = await CallApi.getAllReservations();
                const filteredReservations = callDataReservations.filter(reservation => reservation.status === 1);

                if (filteredReservations.length > 0 && customerId) {
                    const foundReservation = CallApi.findReservationById(filteredReservations, customerId);
                    setReservationId(foundReservation);

                    const callDataRealEstateData = await CallApi.getAllRealEstate();
                    if (callDataRealEstateData && foundReservation) {
                        const foundRealEstate = CallApi.findRealEstateById(callDataRealEstateData, foundReservation.realEstateId);
                        setRealEstateId(foundRealEstate);
                    }
                } else {
                    console.log("No reservations found with status 1 for the customer");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, [customerId]);

    // Function để gửi yêu cầu cập nhật trạng thái đơn hàng
    const cancelReservation = async () => {
        setLoading(true); // Bắt đầu tải
        try {
            // Tạo đối tượng dữ liệu để gửi đi
            const requestData = {
                status: 0,
                realEstateId: reservationId.id,
                customerId: reservationId.customerId,
                agencyId: '',
                bookingDate: reservationId.bookingDate,
                bookingTime: reservationId.bookingTime,
            };

            // Gửi yêu cầu POST đến URL cụ thể với dữ liệu requestData
            await axios.put(`http://firstrealestate-001-site1.anytempurl.com/api/reservation/UpdateReservation/${reservationId.id}`, requestData);

            // Cập nhật trạng thái đơn hàng ở client
            window.location.reload();

            setLoading(false); // Kết thúc tải
        } catch (error) {
            console.error("Error updating reservation:", error);
            setLoading(false); // Kết thúc tải (có lỗi xảy ra)
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    };

    return (
        <div className='container'>
            <CustomerMenu
                userLoginBasicInformationDto={userLoginBasicInformationDto}
                UserMenu={UserCustomer}
            />
            <div>
                {reservationId ? (
                    <div className='infobook'>
                        <h1>Thông tin đặt chỗ</h1>
                        <p><b>Stt đơn hàng:</b> {reservationId.id}</p>
                        <p><b>Ngày đặt lịch bất động sản: </b> {formatDate(reservationId.createAt)}</p>
                        <p><b>Tên khách hàng: </b> {userLoginBasicInformationDto?.username}</p>
                        {realEstateId ? (
                            <div>
                                <p><b>Tên bất động sản: </b> {realEstateId.realestateName}</p>
                                <p><b>Ngày xem bất động sản:</b> {formatDate(reservationId.bookingDate)}</p>
                                <p><b>Giờ xem bất động sản:</b> {reservationId.bookingTime}</p>
                                <p><b>Thông tin liên hệ người dẫn xem bất động sản: </b> Đang cập nhật .....</p>
                                {/* Nút Hủy đặt */}
                                {!loading && reservationId.status === 1 && (
                                    <button onClick={cancelReservation}>Hủy đặt</button>
                                )}
                                {/* Hiển thị khi đang tải */}
                                {loading && <p>Đang xử lý...</p>}
                            </div>
                        ) : (
                            <p>Đang tải dữ liệu</p>
                        )}
                    </div>
                ) : (
                    <p>Bạn chưa đặt đơn</p>
                )}
            </div>
        </div>
    );
}
