using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Main : MonoBehaviour
{
    public GameObject ship;

    private Plane worldPlane;

    private float enter = 0.0f;

    private float rotationSpeed = 10;

    //values for internal use
    private Quaternion lookRotation;
    private Vector3 direction;
    
    public static float AngleDifference(float angle1, float angle2)
    {
        float diff = (angle2 - angle1 + 180) % 360 - 180;
        return diff < -180 ? diff + 360 : diff;
    }
    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("Cursor position: " + ship.transform.position.x + " - " + ship.transform.position);

        worldPlane = new Plane(Vector3.up, 0);
    }

    void FixedUpdate()
    {
        // if (Input.GetMouseButtonDown(0))
        // {
        // klikk
        // }
        Vector3 mousePos = Input.mousePosition;
        {
            Ray ray = Camera.main.ScreenPointToRay(mousePos);

            if (worldPlane.Raycast(ray, out enter))
            {
                Vector3 hitPoint = ray.GetPoint(enter);
                direction = (hitPoint - ship.transform.position).normalized;
                lookRotation = Quaternion.LookRotation(direction);

                float zDiff = AngleDifference(lookRotation.eulerAngles.y, ship.transform.rotation.eulerAngles.y);
                if (zDiff < -90)
                {
                    zDiff = -90;
                }
                else
                if (zDiff > 90)
                {
                    zDiff = 90;
                }

                ship.transform.rotation = Quaternion.Slerp(ship.transform.rotation, Quaternion.Euler(new Vector3(0, lookRotation.eulerAngles.y, zDiff)), Time.fixedDeltaTime * rotationSpeed);

            }
        }
    }
}