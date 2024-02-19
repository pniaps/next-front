"use client"

import UpdateProfileInformation from "./UpdateProfileInformationForm";
import UpdatePasswordForm from "./UpdatePasswordForm";
import DeleteUserForm from "./DeleteUserForm";

export default function Profile({auth, mustVerifyEmail, status}) {
    return (
        <div className="my-3 lg:my-8">
            <div className="max-w-7xl mx-auto px-3 lg:px-8 space-y-6">
                <div className="p-4 lg:p-8 bg-white shadow sm:rounded-lg">
                    <UpdateProfileInformation
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="p-4 lg:p-8 bg-white shadow sm:rounded-lg">
                    <UpdatePasswordForm className="max-w-xl"/>
                </div>

                <div className="p-4 lg:p-8 bg-white shadow sm:rounded-lg">
                    <DeleteUserForm className="max-w-xl"/>
                </div>
            </div>
        </div>
    )
}
