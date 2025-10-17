public class User
{
    public int EmployeeId { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public string Email { get; set; }

    public string PhoneNumber { get; set; }

    public string Password { get; set; }

    public string Birthday { get; set; }

    public string Role { get; set; }


    public User(int employeeId, string firstName, string lastName, string email, string phoneNumber, string passWord, string birthDay, string role)
    {
        EmployeeId = employeeId;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PhoneNumber = phoneNumber;
        Password = passWord;
        Birthday = birthDay;
        Role = role;
    }
}