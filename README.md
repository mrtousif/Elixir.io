# ELIXIR.IO

## Description: A health care wellbeing application.

## Estimated Features:

    1. Virtual Care (Telehealth)
        - Schedule in-person or virtual meetings between medical professionals and patients for regular checkups on wellbeing.
        - Both professionals and patients are able to transfer files in real-time communication. These files can be audio, video, or text files.

    2. Access to immediate care
        - Patient have access to nearest clinics and pharmacies, in order to get attention to minor illnesses such as flu shots, vaccines and allergies, without waiting for an appointment.

    3. Prescription Management
        - Drug reminder: This can remind patients to take their in right dosages.
        - Fetches price of drug prescription based on local pharmacies.
        - Prescription drug list.


## Estimated Technologies:
- JavaScript
- TypeScript
- Vue.Js
- Nest.Js / Node.Js
- MongoDB
- WebSockets /Socket.io
- CircleCI
- RabbitMQ
- Agora /WebRTC / VoIP
- AWS Serverless
- Geo-location


## Latest Features:

    1. The service has two registration sections:
        - Admin registration
        - User registration

    2. The user registration is also made of two registration sections:
        - The registration for medical providers
        - The registration for patients

    3. Registration as a patient or a medical doctor, creates a profile for the party.

    4. Attributes of the patient profile:
        - imageUrl: This attribute is not yet implemented, but it will be working with AWS S3.
        - user: This is a reference to the created user account.
        - firstName
        - lastName
        - age
        - address
        - telephone
        - occupation
        - maritalStatus
        - occupation
        - medicalIssues: This will based on diagnostics and test results.
        - prescriptions: Drug prescriptions that contains the issued date, issuer, drug info and dosage.
        - doctorName: This is the full name of the assigned doctor observing the patient.
        - doctorTelephone
        - doctorAddress
        - pharmacyTelephone: The telephone number of the pharmacist of which the patient got the drugs from. (I'm not sure if this feature is necessary).

    5. The patient is only able to edit certain attributes such as:
        - imageUrl: This attribute is not yet implemented, but it will be working with AWS S3.
        - firstName
        - lastName
        - age
        - address
        - telephone
        - occupation
        - maritalStatus
        - occupation

    6. Attributes of the doctor profile:
        - imageUrl: This attribute is not yet implemented, but it will be working with AWS S3
        - user: This is a reference to the created user account.
        - firstName
        - lastName
        - age
        - address
        - telephone
        - maritalStatus
        - specialties: These are various areas of specialties of the practicing doctor.
        - certificates: The certificates of the practicing doctor.
        - hierarchy: This is just the professional rank of the practicing doctor.
        - yearsOfExperience
        - languages
        - department
        - directingDoctor: The doctor monitoring the activities of the practicing doctor.
        - subordinateDoctors: The doctors under the responsibility of the practicing doctor.
        - assignedPatients: The patients under the care of the practicing doctor.

    7. The doctor is only able to update certain features of his or her profile, such as:
        - imageUrl: This attribute is not yet implemented, but it will be working with AWS S3.
        - firstName
        - lastName
        - age
        - address
        - telephone
        - maritalStatus
        - certificates: The certificates of the practicing doctor.
        - yearsOfExperience
        - languages
    
    8. The departments available to doctors to be assigned to:
        - Cardiology
        - Dermatology 
        - Urology
        - IntensiveCareMedicine
        - Neurology
        - Surgery
        - Radiology
        - Pharmacy


